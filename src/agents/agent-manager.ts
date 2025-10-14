/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import type { AgentConfig, AgentResult, AgentToolParams } from '../types/agent.js';

export const agentManagerConfig: AgentConfig = {
  name: 'agent-manager',
  description: 'Create, analyze, improve, and manage MCP tools and agent definitions',
  capabilities: [
    'Agent/tool creation and scaffolding',
    'Agent registry management',
    'Tool definition validation',
    'Documentation generation',
    'Capability analysis and optimization',
  ],
  context: `
# Agent Manager

You are an expert in MCP (Model Context Protocol) tool development and agent architecture.

## Core Responsibilities
- **Tool Creation**: Design and scaffold new MCP tools following best practices
- **Registry Management**: Maintain consistent tool catalog and documentation
- **Validation**: Ensure tool definitions follow MCP schema and conventions
- **Documentation**: Generate comprehensive tool docs with examples
- **Optimization**: Identify redundancies and consolidation opportunities

## Tool Development Principles
1. **Single Responsibility**: Each tool should have one clear purpose
2. **Clear Interfaces**: Well-defined input schemas with Zod validation
3. **Error Handling**: Comprehensive error handling and meaningful messages
4. **Documentation**: Inline docs, usage examples, and Context7 queries
5. **Testing**: Unit tests for all tool logic

## MCP Tool Structure
\`\`\`typescript
server.registerTool(
  'tool-name',
  {
    description: 'Clear, concise description',
    inputSchema: z.object({
      param: z.string().describe('Parameter description')
    }).shape,
  },
  async (params) => {
    // Tool implementation
    return {
      content: [{
        type: 'text',
        text: 'Result'
      }]
    };
  }
);
\`\`\`

## Agent-to-Tool Migration
When converting agents to MCP tools:
1. Extract core capabilities as tool parameters
2. Convert agent context to tool description + prompt
3. Add Context7 documentation queries
4. Implement input validation with Zod
5. Add comprehensive error handling
6. Write unit tests

## Output Format
- **Tool Definition**: Complete TypeScript code
- **Schema**: Zod input validation
- **Documentation**: Usage examples and Context7 queries
- **Tests**: Jest test cases
- **Integration**: Registration in MCP server

## Best Practices
- Follow MCP SDK patterns
- Use TypeScript strict mode
- Validate all inputs with Zod
- Return structured content blocks
- Include usage examples
- Document Context7 requirements
`,
  documentation: {
    queries: [
      'mcp://context7/mcp/model-context-protocol',
      'mcp://context7/mcp/tool-development',
      'mcp://context7/typescript/zod-validation',
      'mcp://context7/architecture/agent-design',
    ],
    why: 'Ensures tools follow MCP standards and architectural best practices',
  },
};

export async function executeAgentManager(params: AgentToolParams): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const prompt = buildManagerPrompt(params);

    return {
      success: true,
      content: prompt,
      metadata: {
        agent: 'agent-manager',
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
        agent: 'agent-manager',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      },
    };
  }
}

function buildManagerPrompt(params: AgentToolParams): string {
  const { task, scope, options } = params;

  let prompt = `${agentManagerConfig.context}\n\n`;
  prompt += `## Agent Management Task\n${task}\n\n`;

  if (scope) {
    prompt += `## Scope\n${scope}\n\n`;
  }

  if (options?.agentType) {
    prompt += `## Agent Type\n${options.agentType}\n\n`;
  }

  if (options?.capabilities) {
    prompt += `## Required Capabilities\n`;
    const caps = Array.isArray(options.capabilities) ? options.capabilities : [options.capabilities];
    caps.forEach((cap) => {
      prompt += `- ${cap}\n`;
    });
    prompt += `\n`;
  }

  prompt += `## Required Actions\n`;
  prompt += `1. Analyze the requirements\n`;
  prompt += `2. Design the tool/agent structure\n`;
  prompt += `3. Implement following MCP best practices\n`;
  prompt += `4. Add Zod validation for inputs\n`;
  prompt += `5. Include Context7 documentation queries\n`;
  prompt += `6. Generate usage examples\n`;
  prompt += `7. Create unit tests\n\n`;

  prompt += `Begin the agent management task now.`;

  return prompt;
}
