# PM Migration Plan: ClaudeAutoPM → GeminiAutoPM

**Project:** Migrate complete PM (Project Management) functionality from ClaudeAutoPM to GeminiAutoPM
**Date:** 2025-10-15
**Methodology:** 1:1 functional migration using MCP tools architecture
**Reference Frameworks:** Agentic PM, MCP TypeScript SDK best practices

## Executive Summary

Migracja 45 komend PM (~5,584 linii), agentów, reguł i hooków z ClaudeAutoPM (slash commands) do GeminiAutoPM (MCP tools). Zachowanie 100% funkcjonalności z adaptacją na architekturę MCP.

## Context7 Best Practices Applied

Based on `/sdi2200262/agentic-project-management` and `/modelcontextprotocol/typescript-sdk`:

### 1. **Multi-Agent Architecture**
- Manager Agent (PM Server) - orchestrates workflow
- Implementation Agents (specialized PM tools) - execute specific tasks
- Memory Bank pattern - shared context across operations

### 2. **MCP Tool Design Patterns**
- Tool registration with Zod schemas
- Input/output validation
- Structured content responses
- Dynamic tool enable/disable
- Context7 integration for documentation queries

### 3. **Task Decomposition Strategy**
- Break complex commands into atomic MCP tools
- Parallel execution where possible
- Clear dependencies and handover protocols

## Source Inventory (ClaudeAutoPM)

### Commands Structure
```
autopm/.claude/commands/pm/          # 45 commands
├── Epic Management (12 commands)
│   ├── epic-decompose.md           # ⭐ Core: Break epic into tasks
│   ├── epic-start.md               # Start working on epic
│   ├── epic-sync.md                # Sync to GitHub/Azure
│   ├── epic-close.md               # Close completed epic
│   ├── epic-show.md                # Display details
│   ├── epic-list.md                # List all epics
│   ├── epic-status.md              # Status overview
│   ├── epic-edit.md                # Edit epic
│   ├── epic-refresh.md             # Refresh from remote
│   ├── epic-merge.md               # Merge epics
│   ├── epic-split.md               # Split into sub-epics
│   └── epic-oneshot.md             # Quick creation
│
├── Issue/Task Management (9 commands)
│   ├── issue-start.md              # Start working
│   ├── issue-sync.md               # Sync to remote
│   ├── issue-close.md              # Close issue
│   ├── issue-analyze.md            # Analyze issue
│   ├── issue-show.md               # Display details
│   ├── issue-edit.md               # Edit issue
│   ├── issue-reopen.md             # Reopen closed
│   └── issue-status.md             # Status check
│
├── PRD Management (5 commands)
│   ├── prd-new.md                  # Create PRD
│   ├── prd-parse.md                # Parse into epic
│   ├── prd-edit.md                 # Edit PRD
│   ├── prd-list.md                 # List PRDs
│   └── prd-status.md               # PRD status
│
├── Context Management (4 commands)
│   ├── context.md                  # Context operations
│   ├── context-create.md           # Create context
│   ├── context-prime.md            # Prime context
│   └── context-update.md           # Update context
│
└── Workflow Commands (15 commands)
    ├── init.md                     # Initialize PM
    ├── help.md                     # Help system
    ├── status.md                   # Overall status
    ├── validate.md                 # Validate structure
    ├── sync.md                     # Sync all
    ├── clean.md                    # Cleanup
    ├── standup.md                  # Daily standup
    ├── what-next.md                # Next task
    ├── next.md                     # Next item
    ├── search.md                   # Search tasks
    ├── blocked.md                  # Blocked items
    ├── in-progress.md              # In progress
    └── import.md                   # Import external
```

### Key Features to Migrate

1. **Epic Decomposition** (epic-decompose.md - 370 lines)
   - Context7 query integration
   - TDD enforcement
   - Parallel task creation
   - Multi-epic support
   - Frontmatter management
   - Dependency tracking

2. **Sync Operations**
   - GitHub integration
   - Azure DevOps integration
   - Bidirectional sync
   - Conflict resolution

3. **File Structure Management**
   - `.claude/epics/` directory structure
   - Frontmatter parsing/updating
   - Task numbering (001.md, 002.md...)
   - Memory Bank logging

4. **Workflow Automation**
   - Preflight checks
   - Validation steps
   - Status tracking
   - Progress reporting

## Target Architecture (GeminiAutoPM)

### MCP Server Structure

```
GeminiAutoPM/
├── src/
│   ├── servers/
│   │   ├── pm-server.ts              # Main PM MCP Server
│   │   └── base-server.ts            # ✅ Already exists
│   │
│   ├── tools/
│   │   ├── pm/
│   │   │   ├── epic/
│   │   │   │   ├── decompose.ts      # Epic decomposition tool
│   │   │   │   ├── start.ts          # Start epic tool
│   │   │   │   ├── sync.ts           # Sync epic tool
│   │   │   │   ├── close.ts          # Close epic tool
│   │   │   │   ├── show.ts           # Show epic tool
│   │   │   │   ├── list.ts           # List epics tool
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── issue/
│   │   │   │   ├── start.ts
│   │   │   │   ├── sync.ts
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── prd/
│   │   │   │   ├── new.ts
│   │   │   │   ├── parse.ts
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── context/
│   │   │   │   └── ...
│   │   │   │
│   │   │   └── workflow/
│   │   │       └── ...
│   │   │
│   │   └── shared/
│   │       ├── file-ops.ts           # File operations utilities
│   │       ├── frontmatter.ts        # Frontmatter parsing
│   │       ├── git-ops.ts            # Git operations
│   │       └── validation.ts         # Validation utilities
│   │
│   ├── prompts/
│   │   └── pm/
│   │       └── epic-decompose.ts     # ✅ Already exists
│   │
│   └── lib/
│       ├── memory-bank.ts            # Memory Bank implementation
│       ├── github-client.ts          # GitHub API client
│       └── azure-client.ts           # Azure DevOps client
│
└── test/
    └── tools/
        └── pm/
            └── epic/
                └── decompose.test.ts # TDD tests for each tool
```

## Migration Strategy

### Phase-Based Approach (Following Agentic PM Framework)

### **Phase 1: Foundation & Core Epic Tools (Week 1)**

**Goal:** Establish MCP infrastructure and migrate critical epic management

**Tasks:**

1. **Create PM Server Base** (1 day)
   - Extend `BaseMCPServer` for PM operations
   - Setup tool registry for PM category
   - Implement Context7 integration
   - Configure memory bank system

2. **Shared Utilities** (1 day)
   - File operations (read/write `.claude/epics/`)
   - Frontmatter parser (YAML front matter)
   - Git operations wrapper
   - Validation utilities

3. **Epic Decompose Tool** (2 days) ⭐ PRIORITY
   - Convert `epic-decompose.md` → MCP tool
   - Input schema: `epicName`, `local flag`, `multiEpic mode`
   - Output schema: `tasksCreated`, `summary`, `stats`
   - Implement preflight checks
   - Context7 queries for agile best practices
   - Parallel task creation using sub-agents
   - TDD requirements injection

4. **Epic Basic Operations** (1 day)
   - epic-show tool
   - epic-list tool
   - epic-status tool

**Deliverables:**
- Working PM Server with 4 epic tools
- Test suite (80%+ coverage)
- Example usage documentation

**Context7 Documentation Queries:**
- `mcp://context7/agile/epic-decomposition`
- `mcp://context7/agile/task-sizing`
- `mcp://context7/typescript/mcp-tools`

### **Phase 2: Epic Lifecycle Management (Week 2)**

**Goal:** Complete epic management workflow

**Tasks:**

1. **Epic Start/Close** (1 day)
   - epic-start tool
   - epic-close tool
   - Status transitions

2. **Epic Editing** (1 day)
   - epic-edit tool
   - epic-merge tool
   - epic-split tool

3. **Epic Sync** (2 days)
   - GitHub sync implementation
   - Azure DevOps sync implementation
   - Conflict resolution
   - Bidirectional sync

4. **Epic Advanced** (1 day)
   - epic-oneshot tool
   - epic-refresh tool

**Deliverables:**
- Complete epic management (12 tools)
- GitHub/Azure integration tests
- Sync workflow documentation

**Context7 Documentation Queries:**
- `mcp://context7/github/api-integration`
- `mcp://context7/azure-devops/work-items`

### **Phase 3: Issue/Task Management (Week 3)**

**Goal:** Migrate task/issue operations

**Tasks:**

1. **Issue Basic Operations** (1 day)
   - issue-show tool
   - issue-start tool
   - issue-status tool

2. **Issue Lifecycle** (1 day)
   - issue-edit tool
   - issue-close tool
   - issue-reopen tool

3. **Issue Sync** (2 days)
   - GitHub issues sync
   - Azure work items sync
   - issue-analyze tool

4. **Task Management** (1 day)
   - Task file operations
   - Dependency tracking
   - Parallel execution support

**Deliverables:**
- Issue/task management (9 tools)
- Dependency resolution
- Integration tests

### **Phase 4: PRD & Context Management (Week 4)**

**Goal:** Document management and context operations

**Tasks:**

1. **PRD Management** (2 days)
   - prd-new tool
   - prd-parse tool (PRD → Epic conversion)
   - prd-edit tool
   - prd-list tool
   - prd-status tool

2. **Context Operations** (2 days)
   - context-create tool
   - context-prime tool
   - context-update tool
   - context tool (general)

3. **Memory Bank Integration** (1 day)
   - Memory bank logging
   - Context preservation
   - Handover protocol

**Deliverables:**
- PRD management (5 tools)
- Context operations (4 tools)
- Memory bank system

**Context7 Documentation Queries:**
- `mcp://context7/project-management/prd-templates`
- `mcp://context7/agile/context-management`

### **Phase 5: Workflow & Utilities (Week 5)**

**Goal:** Complete migration with workflow automation

**Tasks:**

1. **Initialization & Help** (1 day)
   - init tool
   - help tool
   - validate tool

2. **Status & Reporting** (1 day)
   - status tool
   - standup tool
   - what-next tool
   - next tool

3. **Operations** (2 days)
   - sync tool (sync all)
   - clean tool
   - import tool
   - search tool

4. **Filters** (1 day)
   - blocked tool
   - in-progress tool

**Deliverables:**
- Complete PM toolset (45 tools)
- Workflow automation
- Full documentation

## Technical Implementation Details

### 1. **MCP Tool Pattern**

Based on Context7 MCP TypeScript SDK best practices:

```typescript
// Example: Epic Decompose Tool
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

server.registerTool(
  'epic_decompose',
  {
    title: 'Epic Decompose',
    description: 'Break epic into concrete, actionable tasks',
    inputSchema: {
      epicName: z.string().describe('Name of the epic to decompose'),
      local: z.boolean().optional().describe('Use local mode (offline)'),
      multiEpic: z.boolean().optional().describe('Process all epics in structure'),
    },
    outputSchema: {
      tasksCreated: z.number(),
      epicPath: z.string(),
      tasks: z.array(z.object({
        number: z.string(),
        title: z.string(),
        parallel: z.boolean(),
        dependsOn: z.array(z.string()),
      })),
      stats: z.object({
        totalTasks: z.number(),
        parallelTasks: z.number(),
        sequentialTasks: z.number(),
        estimatedHours: z.number(),
      }),
    },
  },
  async ({ epicName, local, multiEpic }) => {
    // 1. Query Context7 for best practices
    const agileGuide = await context7.query('agile', 'epic-decomposition');
    const taskSizingGuide = await context7.query('agile', 'task-sizing');

    // 2. Preflight checks
    await validateEpicExists(epicName);
    await checkExistingTasks(epicName);

    // 3. Read epic file(s)
    const epics = await readEpicFiles(epicName, multiEpic);

    // 4. Decompose using Context7 guidance
    const tasks = await decomposeWithContext7(epics, agileGuide, taskSizingGuide);

    // 5. Create task files with TDD requirements
    const created = await createTaskFiles(epicName, tasks);

    // 6. Update epic with task summary
    await updateEpicSummary(epicName, created);

    // 7. Log to Memory Bank
    await memoryBank.log('epic_decompose', { epicName, tasksCreated: created.length });

    const output = {
      tasksCreated: created.length,
      epicPath: `.claude/epics/${epicName}`,
      tasks: created,
      stats: calculateStats(created),
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(output, null, 2),
      }],
      structuredContent: output,
    };
  }
);
```

### 2. **Frontmatter Management**

```typescript
// src/lib/frontmatter.ts
import matter from 'gray-matter';

export interface EpicFrontmatter {
  name: string;
  status: 'open' | 'in-progress' | 'completed';
  created: string;
  updated: string;
  github?: string;
  azure?: string;
  progress?: number;
}

export interface TaskFrontmatter {
  name: string;
  status: 'open' | 'in-progress' | 'completed';
  created: string;
  updated: string;
  github?: string;
  depends_on: string[];
  parallel: boolean;
  conflicts_with: string[];
}

export function parseFrontmatter<T>(content: string): { data: T; content: string } {
  const parsed = matter(content);
  return { data: parsed.data as T, content: parsed.content };
}

export function updateFrontmatter<T>(content: string, updates: Partial<T>): string {
  const { data, content: body } = parseFrontmatter<T>(content);
  const updated = { ...data, ...updates, updated: new Date().toISOString() };
  return matter.stringify(body, updated);
}
```

### 3. **Memory Bank Pattern**

Following Agentic PM framework:

```typescript
// src/lib/memory-bank.ts
export class MemoryBank {
  private logPath: string;

  constructor(projectPath: string) {
    this.logPath = `${projectPath}/Memory_Bank.md`;
  }

  async log(
    action: string,
    details: Record<string, unknown>,
    agentId: string = 'PM-Agent'
  ): Promise<void> {
    const entry = `
## ${new Date().toISOString()} - ${action}

**Agent:** ${agentId}
**Action:** ${action}
**Details:**
\`\`\`json
${JSON.stringify(details, null, 2)}
\`\`\`

---
`;

    await appendFile(this.logPath, entry);
  }

  async getRecentLogs(count: number = 10): Promise<string[]> {
    const content = await readFile(this.logPath, 'utf-8');
    const logs = content.split('---').slice(-count);
    return logs;
  }
}
```

### 4. **Git Operations Wrapper**

```typescript
// src/lib/git-ops.ts
import { simpleGit, SimpleGit } from 'simple-git';

export class GitOperations {
  private git: SimpleGit;

  constructor(private projectPath: string) {
    this.git = simpleGit(projectPath);
  }

  async getCurrentBranch(): Promise<string> {
    const status = await this.git.status();
    return status.current || 'main';
  }

  async stageAndCommit(files: string[], message: string): Promise<void> {
    await this.git.add(files);
    await this.git.commit(message);
  }

  async push(remote: string = 'origin', branch?: string): Promise<void> {
    const currentBranch = branch || await this.getCurrentBranch();
    await this.git.push(remote, currentBranch);
  }
}
```

## Testing Strategy

### TDD Approach (Following ROADMAP.md)

1. **Write tests FIRST** for each tool
2. **Jest framework** with ESM support
3. **80%+ coverage** target
4. **Integration tests** for sync operations

### Test Structure

```typescript
// test/tools/pm/epic/decompose.test.ts
describe('Epic Decompose Tool', () => {
  describe('Input Validation', () => {
    it('should validate epicName is required');
    it('should accept optional local flag');
    it('should accept optional multiEpic flag');
  });

  describe('Preflight Checks', () => {
    it('should verify epic exists');
    it('should detect single vs multi-epic mode');
    it('should check for existing tasks');
    it('should validate epic frontmatter');
  });

  describe('Task Decomposition', () => {
    it('should decompose single epic into tasks');
    it('should handle multi-epic structure');
    it('should apply Context7 best practices');
    it('should inject TDD requirements');
    it('should track dependencies');
    it('should mark parallel tasks');
  });

  describe('File Operations', () => {
    it('should create numbered task files (001.md, 002.md)');
    it('should write correct frontmatter');
    it('should update epic with task summary');
  });

  describe('Memory Bank', () => {
    it('should log decomposition action');
    it('should include task statistics');
  });

  describe('Error Handling', () => {
    it('should handle missing epic gracefully');
    it('should recover from partial completion');
    it('should provide clear error messages');
  });
});
```

## Migration Validation Checklist

### Per-Tool Validation

For each migrated command:

- [ ] Input parameters match original command
- [ ] Output format preserves all information
- [ ] Error handling matches original behavior
- [ ] Context7 queries implemented
- [ ] Tests written (80%+ coverage)
- [ ] Documentation updated
- [ ] Integration tests pass

### System-Level Validation

- [ ] All 45 commands migrated
- [ ] File structure compatibility maintained
- [ ] GitHub sync works (create, update, close issues)
- [ ] Azure DevOps sync works (work items)
- [ ] Memory Bank logging functional
- [ ] Parallel execution works
- [ ] Dependency tracking accurate
- [ ] TDD enforcement active

## Documentation Requirements

### Per-Tool Documentation

Each tool needs:

1. **Tool Description** (from original command)
2. **Documentation Queries** (Context7 MCP links)
3. **Input Schema** (Zod schema with descriptions)
4. **Output Schema** (Structured response format)
5. **Usage Examples** (TypeScript/CLI examples)
6. **Error Codes** (Error handling documentation)

### Example Tool Documentation

```markdown
## epic_decompose

**Description:** Break epic into concrete, actionable tasks following INVEST criteria.

**Documentation Queries:**
- `mcp://context7/agile/epic-decomposition` - Epic breakdown best practices
- `mcp://context7/agile/task-sizing` - Task estimation and sizing
- `mcp://context7/agile/user-stories` - User story formats (INVEST criteria)

**Input Schema:**
```typescript
{
  epicName: string;        // Name of epic to decompose
  local?: boolean;         // Use local mode (default: false)
  multiEpic?: boolean;     // Process all epics (default: false)
}
```

**Output Schema:**
```typescript
{
  tasksCreated: number;
  epicPath: string;
  tasks: Array<{
    number: string;
    title: string;
    parallel: boolean;
    dependsOn: string[];
  }>;
  stats: {
    totalTasks: number;
    parallelTasks: number;
    sequentialTasks: number;
    estimatedHours: number;
  };
}
```

**Usage Example:**
```typescript
// Call tool via MCP
const result = await mcpClient.callTool('epic_decompose', {
  epicName: 'user-authentication',
  local: true,
  multiEpic: false,
});

console.log(`Created ${result.tasksCreated} tasks`);
```

**Error Codes:**
- `EPIC_NOT_FOUND` - Epic directory does not exist
- `INVALID_FRONTMATTER` - Epic file has invalid frontmatter
- `TASKS_EXIST` - Tasks already exist (requires confirmation)
```

## Risk Mitigation

### Identified Risks

1. **Complex Command Logic**
   - **Risk:** Some commands (epic-sync) have 300+ lines of complex logic
   - **Mitigation:** Break into smaller MCP tools, extensive testing

2. **File System Operations**
   - **Risk:** Race conditions in parallel file operations
   - **Mitigation:** Use file locking, transaction-like patterns

3. **GitHub/Azure API Changes**
   - **Risk:** API breaking changes
   - **Mitigation:** Abstract API clients, version pinning, integration tests

4. **Context Preservation**
   - **Risk:** Loss of context between tool calls
   - **Mitigation:** Memory Bank pattern, persistent state management

5. **Migration Completeness**
   - **Risk:** Missing edge cases from original commands
   - **Mitigation:** Comprehensive test suite, validation checklist

### Rollback Strategy

If migration encounters critical issues:

1. **Preserve Original Commands**
   - Keep `autopm/.claude/commands/pm/` as reference
   - Document all deviations

2. **Phased Rollout**
   - Deploy phase by phase
   - Validate each phase before proceeding

3. **Compatibility Layer**
   - If needed, create adapter layer that wraps MCP tools to mimic slash commands

## Success Metrics

### Quantitative Metrics

- [ ] 45/45 commands migrated (100%)
- [ ] 80%+ test coverage
- [ ] All integration tests passing
- [ ] Performance: Tool execution < 2s (excluding network I/O)
- [ ] Zero data loss in file operations

### Qualitative Metrics

- [ ] Developer experience matches or exceeds original
- [ ] Documentation clarity improved
- [ ] Error messages more helpful
- [ ] Context7 integration provides value

## Timeline Summary

| Phase | Duration | Deliverables | Tools Count |
|-------|----------|-------------|-------------|
| Phase 1: Foundation & Epic Core | Week 1 | PM Server + 4 epic tools | 4 |
| Phase 2: Epic Lifecycle | Week 2 | Complete epic management | 12 |
| Phase 3: Issue/Task Management | Week 3 | Issue/task operations | 21 |
| Phase 4: PRD & Context | Week 4 | Document management | 30 |
| Phase 5: Workflow & Utilities | Week 5 | Complete toolset | 45 |

**Total Duration:** 5 weeks
**Total Tools:** 45 MCP tools

## Next Steps

### Immediate Actions

1. **Review this plan** with team/stakeholders
2. **Set up development environment**
   - Clone both repos
   - Install dependencies
   - Configure Context7 MCP access

3. **Start Phase 1**
   - Create PM Server scaffold
   - Implement shared utilities
   - Begin epic-decompose tool (TDD)

### Weekly Reviews

Each Friday:
- Review progress against plan
- Update todo list
- Adjust timeline if needed
- Document blockers and resolutions

---

**Prepared by:** Claude (Sonnet 4.5) with Context7 integration
**References:**
- Agentic PM Framework: `/sdi2200262/agentic-project-management`
- MCP TypeScript SDK: `/modelcontextprotocol/typescript-sdk`
- ClaudeAutoPM: `/Users/rla/Projects/AUTOPM/autopm`
- GeminiAutoPM: `/Users/rla/Projects/GeminiAutoPM`
