# GeminiAutoPM Architecture

## 🏗️ System Overview

GeminiAutoPM wykorzystuje **multi-server architecture** opartą na Model Context Protocol (MCP), gdzie wyspecjalizowane serwery dostarczają zbiory tools dla różnych domen.

```
┌─────────────────────────────────────────────────────────────┐
│                        Gemini CLI                           │
│                   (User Interface Layer)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ MCP Protocol (stdio)
                     │
┌────────────────────┴────────────────────────────────────────┐
│                  GeminiAutoPM Extension                      │
│                    (gemini-extension.json)                   │
└─┬───────┬───────┬──────────┬──────────┬────────────────────┘
  │       │       │          │          │
  │       │       │          │          │ MCP Stdio Transport
  │       │       │          │          │
┌─▼──┐ ┌─▼──┐ ┌─▼──┐  ┌───▼────┐ ┌───▼──────┐
│Agt │ │PM  │ │Dev │  │Lang    │ │Framework │
│Svr │ │Svr │ │Ops │  │Svr     │ │Svr       │
└────┘ └────┘ └────┘  └────────┘ └──────────┘
  │       │      │         │           │
  │       │      │         │           │
  ▼       ▼      ▼         ▼           ▼
┌──────────────────────────────────────────┐
│          Tool Registry System             │
│      (Centralized Metadata Store)         │
└──────────────────────────────────────────┘
  │
  │
  ▼
┌──────────────────────────────────────────┐
│       Context7 Integration Layer          │
│   (Automatic Documentation Queries)       │
└──────────────────────────────────────────┘
```

---

## 📦 Component Architecture

### 1. MCP Servers (Multi-Server Pattern)

#### Why Multiple Servers?

**Advantages:**
- **Separation of Concerns**: Każdy serwer odpowiada za swoją domenę
- **Independent Scaling**: Serwery mogą być włączane/wyłączane niezależnie
- **Easier Maintenance**: Zmiany w jednym serwerze nie wpływają na inne
- **Better Testing**: Każdy serwer testowany w izolacji
- **Selective Loading**: Użytkownik wybiera które serwery włączyć

#### Server Types

**1. agents-server.ts** - Core Analysis Tools
```typescript
// Tools:
- code_analyzer
- test_runner
- file_analyzer
- agent_manager
- security_analyst
- performance_optimizer
- documentation_specialist
```

**2. pm-server.ts** - Project Management
```typescript
// Prompts:
- epic-decompose
- task-breakdown
- sprint-planning
- backlog-refinement
- estimation
- prioritization
```

**3. devops-server.ts** - DevOps Automation
```typescript
// Tools:
- ci-pipeline-analyzer
- deployment-orchestrator
- docker-compose-generator
- kubernetes-manifest-generator
- terraform-module-generator
- rollback-orchestrator
```

**4. languages-server.ts** - Language-Specific
```typescript
// Tools:
- nodejs-backend-engineer
- python-backend-engineer
- javascript-frontend-engineer
- go-backend-engineer
- rust-systems-engineer
- java-enterprise-engineer
```

**5. frameworks-server.ts** - Framework-Specific
```typescript
// Tools:
- react-specialist
- vue-specialist
- express-api-engineer
- django-backend-engineer
- flutter-mobile-engineer
```

---

### 2. Base Server Architecture

```typescript
// src/servers/base-server.ts

export abstract class BaseMCPServer {
  protected server: McpServer;
  protected registry: ToolRegistry;
  protected logger: Logger;
  protected context7: Context7Client;

  constructor(config: ServerConfig) {
    this.server = new McpServer({
      name: config.name,
      version: config.version,
    });
    this.registry = new ToolRegistry();
    this.logger = new Logger(config.name);
    this.context7 = new Context7Client();
  }

  /**
   * Register a tool with automatic Context7 integration
   */
  protected registerTool(
    name: string,
    metadata: ToolMetadata,
    handler: ToolHandler
  ): void {
    // 1. Validate tool definition
    this.validateTool(name, metadata);

    // 2. Register in registry
    this.registry.register(name, metadata);

    // 3. Wrap handler with Context7 queries
    const wrappedHandler = this.wrapWithContext7(
      handler,
      metadata.context7Queries
    );

    // 4. Register with MCP server
    this.server.registerTool(name, {
      description: metadata.description,
      inputSchema: metadata.inputSchema.shape,
    }, wrappedHandler);

    this.logger.info(`Registered tool: ${name}`);
  }

  /**
   * Automatically query Context7 before tool execution
   */
  private wrapWithContext7(
    handler: ToolHandler,
    queries: string[]
  ): ToolHandler {
    return async (params) => {
      // Query Context7 for documentation
      const docs = await this.context7.queryAll(queries);

      // Inject docs into params
      const enhancedParams = {
        ...params,
        _context7Docs: docs,
      };

      // Execute handler
      return handler(enhancedParams);
    };
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.info(`${this.server.name} started successfully`);
  }

  /**
   * Validate tool definition
   */
  protected abstract validateTool(
    name: string,
    metadata: ToolMetadata
  ): void;
}
```

---

### 3. Tool Registry System

```typescript
// src/registry/tool-registry.ts

export class ToolRegistry {
  private tools: Map<string, ToolMetadata> = new Map();

  /**
   * Register a tool with metadata
   */
  register(name: string, metadata: ToolMetadata): void {
    if (this.tools.has(name)) {
      throw new Error(`Tool ${name} already registered`);
    }

    // Validate metadata
    this.validateMetadata(metadata);

    // Store
    this.tools.set(name, metadata);
  }

  /**
   * Get tool metadata
   */
  get(name: string): ToolMetadata | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all tools by category
   */
  getByCategory(category: ToolCategory): ToolMetadata[] {
    return Array.from(this.tools.values())
      .filter(tool => tool.category === category);
  }

  /**
   * Generate documentation
   */
  generateDocs(): string {
    let docs = '# Available Tools\n\n';

    const categories = this.groupByCategory();
    for (const [category, tools] of categories) {
      docs += `## ${category}\n\n`;

      for (const tool of tools) {
        docs += `### ${tool.name}\n`;
        docs += `${tool.description}\n\n`;
        docs += `**Context7 Queries:**\n`;
        tool.context7Queries.forEach(query => {
          docs += `- ${query}\n`;
        });
        docs += '\n';
      }
    }

    return docs;
  }

  /**
   * Validate tool metadata
   */
  private validateMetadata(metadata: ToolMetadata): void {
    if (!metadata.name) {
      throw new Error('Tool name is required');
    }
    if (!metadata.description) {
      throw new Error('Tool description is required');
    }
    if (!metadata.inputSchema) {
      throw new Error('Tool input schema is required');
    }
    if (!metadata.context7Queries || metadata.context7Queries.length === 0) {
      throw new Error('At least one Context7 query is required');
    }
  }

  /**
   * Group tools by category
   */
  private groupByCategory(): Map<ToolCategory, ToolMetadata[]> {
    const grouped = new Map<ToolCategory, ToolMetadata[]>();

    for (const tool of this.tools.values()) {
      if (!grouped.has(tool.category)) {
        grouped.set(tool.category, []);
      }
      grouped.get(tool.category)!.push(tool);
    }

    return grouped;
  }
}

/**
 * Tool metadata interface
 */
export interface ToolMetadata {
  name: string;
  category: ToolCategory;
  description: string;
  inputSchema: ZodSchema;
  context7Queries: string[];
  examples: ToolExample[];
  version: string;
  deprecated?: boolean;
  replacedBy?: string;
}

export enum ToolCategory {
  AGENT = 'agent',
  PM = 'project-management',
  DEVOPS = 'devops',
  LANGUAGE = 'language',
  FRAMEWORK = 'framework',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  DOCUMENTATION = 'documentation',
}

export interface ToolExample {
  description: string;
  input: Record<string, unknown>;
  expectedOutput: string;
}
```

---

### 4. Context7 Integration Layer

```typescript
// src/tools/context7-client.ts

export class Context7Client {
  private cache: Map<string, CachedDoc> = new Map();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  /**
   * Query Context7 for documentation
   */
  async query(
    library: string,
    topic: string,
    tokens: number = 5000
  ): Promise<string> {
    const cacheKey = `${library}/${topic}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.content;
    }

    // Query Context7 MCP
    const result = await this.queryContext7MCP(library, topic, tokens);

    // Cache result
    this.cache.set(cacheKey, {
      content: result,
      timestamp: Date.now(),
    });

    return result;
  }

  /**
   * Query multiple documentation sources
   */
  async queryAll(queries: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    for (const query of queries) {
      const [library, topic] = this.parseQuery(query);
      const doc = await this.query(library, topic);
      results.set(query, doc);
    }

    return results;
  }

  /**
   * Validate that required queries are present
   */
  validateQueries(
    toolName: string,
    queries: string[]
  ): ValidationResult {
    if (!queries || queries.length === 0) {
      return {
        valid: false,
        error: `Tool ${toolName} missing Context7 queries`,
      };
    }

    for (const query of queries) {
      if (!query.startsWith('mcp://context7/')) {
        return {
          valid: false,
          error: `Invalid Context7 query format: ${query}`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Parse Context7 query URL
   */
  private parseQuery(query: string): [string, string] {
    // mcp://context7/security/code-analysis
    const match = query.match(/^mcp:\/\/context7\/([^/]+)\/(.+)$/);
    if (!match) {
      throw new Error(`Invalid Context7 query: ${query}`);
    }
    return [match[1], match[2]];
  }

  /**
   * Query Context7 MCP server
   */
  private async queryContext7MCP(
    library: string,
    topic: string,
    tokens: number
  ): Promise<string> {
    // Implementation depends on Context7 MCP client
    // This is a placeholder
    return `Documentation for ${library}/${topic}`;
  }
}

interface CachedDoc {
  content: string;
  timestamp: number;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}
```

---

### 5. Agent Implementation Pattern

```typescript
// src/agents/{category}/{agent-name}.ts

import type { AgentConfig, AgentResult, AgentToolParams } from '../types/agent.js';

/**
 * Agent configuration and metadata
 */
export const myAgentConfig: AgentConfig = {
  name: 'my-agent',
  description: 'Brief description of what this agent does',
  capabilities: [
    'Capability 1',
    'Capability 2',
    'Capability 3',
  ],
  context: `
# My Agent

You are an expert in [domain].

## Core Responsibilities
- Responsibility 1
- Responsibility 2

## Approach
1. Step 1
2. Step 2

## Output Format
- Format specification

## Best Practices
- Best practice 1
- Best practice 2
`,
  documentation: {
    queries: [
      'mcp://context7/domain/topic1',
      'mcp://context7/domain/topic2',
    ],
    why: 'Explanation of why these queries are needed',
  },
};

/**
 * Execute agent logic
 */
export async function executeMyAgent(
  params: AgentToolParams
): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    // Build prompt from agent context and params
    const prompt = buildPrompt(params);

    return {
      success: true,
      content: prompt,
      metadata: {
        agent: myAgentConfig.name,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      },
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        agent: myAgentConfig.name,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      },
    };
  }
}

/**
 * Build prompt from params
 */
function buildPrompt(params: AgentToolParams): string {
  const { task, scope, options } = params;

  let prompt = `${myAgentConfig.context}\n\n`;
  prompt += `## Task\n${task}\n\n`;

  if (scope) {
    prompt += `## Scope\n${scope}\n\n`;
  }

  // Add options as needed
  if (options) {
    for (const [key, value] of Object.entries(options)) {
      prompt += `## ${key}\n${value}\n\n`;
    }
  }

  prompt += `## Required Actions\n`;
  prompt += `1. Action 1\n`;
  prompt += `2. Action 2\n\n`;

  prompt += `Begin your work now.`;

  return prompt;
}
```

---

### 6. PM Command Pattern (MCP Prompts)

```typescript
// src/prompts/pm/epic-decompose.ts

import { z } from 'zod';
import type { PromptHandler } from '../types/prompt.js';

/**
 * Epic decomposition prompt
 */
export const epicDecomposePrompt: PromptHandler = {
  name: 'epic-decompose',
  metadata: {
    title: 'Epic Decomposition',
    description: 'Break down epic into implementable user stories following INVEST criteria',
    argsSchema: {
      epicName: z.string().describe('Name of the epic to decompose'),
      complexity: z.enum(['low', 'medium', 'high']).optional(),
      context: z.string().optional().describe('Additional context about the epic'),
    },
    context7Queries: [
      'mcp://context7/agile/epic-decomposition',
      'mcp://context7/agile/user-stories',
      'mcp://context7/project-management/task-breakdown',
    ],
  },

  async handler({ epicName, complexity, context }, context7Docs) {
    const agileGuide = context7Docs.get('mcp://context7/agile/epic-decomposition');
    const userStoryGuide = context7Docs.get('mcp://context7/agile/user-stories');

    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: buildEpicPrompt(epicName, complexity, context, {
            agileGuide,
            userStoryGuide,
          }),
        },
      }],
    };
  },
};

function buildEpicPrompt(
  epicName: string,
  complexity?: string,
  context?: string,
  docs?: Record<string, string>
): string {
  return `
You are an expert Agile project manager.

# Task
Decompose the epic "${epicName}" into implementable user stories.

${complexity ? `## Complexity: ${complexity}` : ''}
${context ? `## Context\n${context}` : ''}

# Agile Best Practices (from Context7)
${docs?.agileGuide || 'N/A'}

# User Story Format (from Context7)
${docs?.userStoryGuide || 'N/A'}

# INVEST Criteria
- **I**ndependent: Can be developed separately
- **N**egotiable: Details can be negotiated
- **V**aluable: Delivers value to users
- **E**stimable: Can be estimated
- **S**mall: Can fit in a sprint
- **T**estable: Has clear acceptance criteria

# Output Format
For each user story, provide:

1. **Title**: As a [user], I want [feature] so that [benefit]
2. **Description**: Detailed description
3. **Acceptance Criteria**: Clear, testable criteria
4. **Estimated Complexity**: T-shirt sizing (XS, S, M, L, XL)
5. **Dependencies**: Other stories this depends on
6. **Priority**: High/Medium/Low

# Sprint Allocation
Suggest how to distribute stories across sprints (assuming 2-week sprints).

Begin the decomposition now.
`;
}
```

---

### 7. Testing Architecture

```typescript
// test/unit/agents/my-agent.test.ts

import { describe, it, expect, beforeEach } from '@jest/globals';
import { executeMyAgent, myAgentConfig } from '../../../src/agents/my-agent.js';

describe('MyAgent', () => {
  describe('Configuration', () => {
    it('should have required metadata', () => {
      expect(myAgentConfig.name).toBeTruthy();
      expect(myAgentConfig.description).toBeTruthy();
      expect(myAgentConfig.capabilities).toBeInstanceOf(Array);
      expect(myAgentConfig.capabilities.length).toBeGreaterThan(0);
    });

    it('should include Context7 queries', () => {
      expect(myAgentConfig.documentation).toBeDefined();
      expect(myAgentConfig.documentation?.queries.length).toBeGreaterThan(0);

      // Validate query format
      myAgentConfig.documentation?.queries.forEach(query => {
        expect(query).toMatch(/^mcp:\/\/context7\//);
      });
    });
  });

  describe('Execution', () => {
    it('should execute successfully', async () => {
      const result = await executeMyAgent({
        task: 'Test task',
      });

      expect(result.success).toBe(true);
      expect(result.content).toBeTruthy();
      expect(result.metadata?.agent).toBe(myAgentConfig.name);
    });

    it('should include agent context in prompt', async () => {
      const result = await executeMyAgent({
        task: 'Test task',
      });

      expect(result.content).toContain('My Agent');
      expect(result.content).toContain('Core Responsibilities');
    });

    it('should handle errors gracefully', async () => {
      // Test error handling
    });
  });
});
```

---

## 🔄 Data Flow

### Tool Invocation Flow

```
1. User Input (Gemini CLI)
   "Use code_analyzer to review auth module"
   │
   ▼
2. Gemini Model Decision
   Decides to invoke code_analyzer tool
   │
   ▼
3. MCP Protocol Message
   {
     "method": "tools/call",
     "params": {
       "name": "code_analyzer",
       "arguments": {
         "task": "review auth module",
         "scope": "security"
       }
     }
   }
   │
   ▼
4. agents-server.ts receives call
   │
   ▼
5. Context7 Integration (Automatic)
   - Query: mcp://context7/security/code-analysis
   - Query: mcp://context7/security/vulnerability-scanning
   - Cache results (15 min TTL)
   │
   ▼
6. Tool Handler Execution
   - Inject Context7 docs into params
   - Build prompt from agent context + params + docs
   - Execute agent logic
   │
   ▼
7. Return Result
   {
     "content": [{
       "type": "text",
       "text": "Detailed analysis prompt..."
     }]
   }
   │
   ▼
8. Gemini Model Processing
   Uses the prompt to generate analysis
   │
   ▼
9. User sees final output
   Formatted analysis with findings
```

---

## 🔐 Security Architecture

### Tool Allowlisting

```json
// System settings (admin controlled)
{
  "tools": {
    "core": [
      "code_analyzer",
      "test_runner",
      "security_analyst"
    ]
  },
  "mcp": {
    "allowed": [
      "autopm-agents",
      "autopm-pm"
    ]
  }
}
```

### Input Validation

All tool inputs validated with Zod:
```typescript
const inputSchema = z.object({
  task: z.string().min(1).max(1000),
  scope: z.enum(['security', 'performance', 'bugs']).optional(),
  files: z.array(z.string()).max(100).optional(),
});
```

### Sandbox Execution

Tools that execute code use Docker sandbox:
```json
{
  "tools": {
    "sandbox": "docker"
  }
}
```

---

## 📊 Performance Considerations

### Caching Strategy

1. **Context7 Docs**: 15 min TTL
2. **Tool Metadata**: In-memory, no expiry
3. **Registry**: Lazy loading

### Optimization Techniques

1. **Lazy Loading**: Load tools on demand
2. **Parallel Queries**: Query Context7 in parallel
3. **Connection Pooling**: Reuse stdio connections
4. **Streaming**: Stream large outputs

---

## 🧩 Extension Points

### Adding New Tools

1. Create agent file: `src/agents/{category}/{name}.ts`
2. Implement `AgentConfig` and `execute{Name}` function
3. Register in appropriate server
4. Add tests
5. Update registry

### Adding New Servers

1. Create server file: `src/servers/{name}-server.ts`
2. Extend `BaseMCPServer`
3. Register tools
4. Add to `gemini-extension.json`
5. Add integration tests

### Custom Tool Types

1. Define interface in `src/types/`
2. Implement handler pattern
3. Register with appropriate server
4. Document in registry

---

## 📚 References

- [MCP Specification](https://modelcontextprotocol.io)
- [Gemini CLI Docs](https://github.com/google-gemini/gemini-cli)
- [ClaudeAutoPM Architecture](../CLAUDE.md)

---

**Status:** Living document - updated as architecture evolves
**Last Updated:** 2025-01-14
