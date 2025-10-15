#!/usr/bin/env node
/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import { z } from 'zod';
import { BaseMCPServer, type ServerConfig } from './base-server.js';
import { ToolCategory } from '../registry/tool-registry.js';
import { buildEpicDecomposePrompt } from '../prompts/pm/epic-decompose.js';

/**
 * Project Management MCP Server
 * Provides tools for agile workflow management, epic decomposition, task breakdown
 *
 * Following Context7 best practices:
 * - Extends BaseMCPServer for common infrastructure
 * - Automatic Context7 documentation queries
 * - Zod schema validation
 * - Comprehensive error handling
 */
export class PMServer extends BaseMCPServer {
  constructor(config?: Partial<ServerConfig>) {
    super({
      name: 'autopm-pm',
      version: '0.1.0',
      enableContext7: true,
      ...config,
    });

    // Initialize all PM tools
    this.initializeTools();
  }

  /**
   * Initialize Project Management tools
   * Phase 1: Core Epic Tools
   */
  protected initializeTools(): void {
    this.logger.info('Initializing PM tools (Phase 1: Core Epic Tools)...');

    // Phase 1: Core Epic Management
    this.registerEpicDecompose();  // ✅ Already implemented
    this.registerEpicShow();         // 🆕 Display epic details
    this.registerEpicList();         // 🆕 List all epics
    this.registerEpicStatus();       // 🆕 Quick status overview

    // Phase 2: Epic Lifecycle (TODO)
    // this.registerEpicStart();
    // this.registerEpicClose();
    // this.registerEpicEdit();
    // this.registerEpicSync();

    // Phase 3: Issue/Task Management (TODO)
    // this.registerIssueStart();
    // this.registerIssueSync();

    // Phase 4: PRD & Context (TODO)
    // this.registerPRDNew();
    // this.registerPRDParse();

    // Phase 5: Workflow & Utilities (TODO)
    // this.registerInit();
    // this.registerStatus();

    const stats = this.registry.getStats();
    this.logger.info(`PM Server initialized with ${stats.totalTools} tools`);
  }

  /**
   * Register epic decomposition tool
   */
  private registerEpicDecompose(): void {
    this.registerTool(
      'epic_decompose',
      {
        name: 'epic_decompose',
        category: ToolCategory.PM,
        description: 'Break down epic into implementable user stories following INVEST criteria',
        inputSchema: z.object({
          epicName: z.string().min(1).describe('Name of the epic to decompose'),
          complexity: z.enum(['low', 'medium', 'high']).optional().describe('Expected complexity level'),
          context: z.string().optional().describe('Additional context about the epic'),
        }),
        context7Queries: [
          'mcp://context7/agile/epic-decomposition',
          'mcp://context7/agile/user-stories',
          'mcp://context7/agile/task-sizing',
          'mcp://context7/project-management/task-breakdown',
        ],
        examples: [
          {
            description: 'Decompose a user authentication epic',
            input: {
              epicName: 'User Authentication System',
              complexity: 'medium',
              context: 'Need OAuth2, JWT tokens, and password reset functionality',
            },
            expectedOutput: 'User stories with acceptance criteria, sprint allocation, and dependencies',
          },
          {
            description: 'Simple epic decomposition',
            input: {
              epicName: 'Dashboard Analytics',
            },
            expectedOutput: 'User stories following INVEST criteria',
          },
        ],
        version: '0.1.0',
      },
      async (params, context7Docs) => {
        const { epicName, complexity, context } = params;

        // Extract Context7 documentation
        const agileGuide = context7Docs?.get('mcp://context7/agile/epic-decomposition');
        const userStoryGuide = context7Docs?.get('mcp://context7/agile/user-stories');

        // Build comprehensive prompt
        const prompt = buildEpicDecomposePrompt(
          epicName,
          complexity,
          context,
          agileGuide,
          userStoryGuide
        );

        return {
          content: [{
            type: 'text',
            text: prompt,
          }],
        };
      }
    );
  }

  /**
   * Register Epic Show Tool
   * Display detailed information about an epic
   */
  private registerEpicShow(): void {
    this.registerTool(
      'epic_show',
      {
        name: 'epic_show',
        category: ToolCategory.PM,
        description: 'Display detailed information about an epic including tasks, progress, and metadata',
        inputSchema: z.object({
          epicName: z.string().describe('Name of the epic to display'),
          verbose: z.boolean().optional().describe('Show detailed task descriptions'),
        }),
        context7Queries: [
          'mcp://context7/agile/epic-management',
          'mcp://context7/project-management/status-reporting',
        ],
        examples: [
          {
            description: 'Show basic epic information',
            input: { epicName: 'user-authentication' },
            expectedOutput: 'Epic details with task list and progress',
          },
        ],
        version: '0.1.0',
      },
      async (params, context7Docs) => {
        this.logger.info(`Showing epic: ${params.epicName}`);

        // TODO: Implement epic show logic
        // 1. Check if epic exists (.claude/epics/{epicName}/epic.md)
        // 2. Read epic frontmatter and content
        // 3. List tasks in epic directory
        // 4. Calculate progress statistics
        // 5. Format output with Context7 best practices

        const placeholder = {
          epicName: params.epicName,
          status: 'open',
          progress: 0,
          totalTasks: 0,
          completedTasks: 0,
          tasks: [],
          message: 'Epic show implementation in progress (Phase 1)',
        };

        return {
          content: [{
            type: 'text',
            text: `# Epic: ${params.epicName}\n\n` +
                  `Status: ${placeholder.status}\n` +
                  `Progress: ${placeholder.progress}%\n` +
                  `Tasks: ${placeholder.totalTasks} (${placeholder.completedTasks} completed)\n\n` +
                  `⚠️  ${placeholder.message}`,
          }],
          structuredContent: placeholder,
        };
      }
    );
  }

  /**
   * Register Epic List Tool
   * List all epics in the project
   */
  private registerEpicList(): void {
    this.registerTool(
      'epic_list',
      {
        name: 'epic_list',
        category: ToolCategory.PM,
        description: 'List all epics in the project with summary information (status, progress, task count)',
        inputSchema: z.object({
          status: z.enum(['all', 'open', 'in-progress', 'completed']).optional()
            .describe('Filter epics by status'),
          sortBy: z.enum(['name', 'progress', 'created', 'updated']).optional()
            .describe('Sort order'),
        }),
        context7Queries: [
          'mcp://context7/agile/epic-management',
          'mcp://context7/project-management/portfolio-view',
        ],
        examples: [
          {
            description: 'List all epics',
            input: {},
            expectedOutput: 'List of all epics with status and progress',
          },
          {
            description: 'List only open epics',
            input: { status: 'open' },
            expectedOutput: 'Filtered list of open epics',
          },
        ],
        version: '0.1.0',
      },
      async (params, context7Docs) => {
        this.logger.info(`Listing epics (filter: ${params.status || 'all'})`);

        // TODO: Implement epic list logic
        // 1. Scan .claude/epics/ directory
        // 2. Read frontmatter from each epic.md
        // 3. Filter by status if specified
        // 4. Sort by specified field
        // 5. Format summary list with Context7 best practices

        const placeholder = {
          epics: [],
          total: 0,
          byStatus: {
            open: 0,
            'in-progress': 0,
            completed: 0,
          },
          message: 'Epic list implementation in progress (Phase 1)',
        };

        return {
          content: [{
            type: 'text',
            text: `# Project Epics\n\n` +
                  `Total: ${placeholder.total}\n` +
                  `Open: ${placeholder.byStatus.open}\n` +
                  `In Progress: ${placeholder.byStatus['in-progress']}\n` +
                  `Completed: ${placeholder.byStatus.completed}\n\n` +
                  `⚠️  ${placeholder.message}`,
          }],
          structuredContent: placeholder,
        };
      }
    );
  }

  /**
   * Register Epic Status Tool
   * Show quick status overview of an epic
   */
  private registerEpicStatus(): void {
    this.registerTool(
      'epic_status',
      {
        name: 'epic_status',
        category: ToolCategory.PM,
        description: 'Show quick status overview of an epic (progress, blocked tasks, next actions)',
        inputSchema: z.object({
          epicName: z.string().describe('Name of the epic'),
        }),
        context7Queries: [
          'mcp://context7/agile/epic-management',
          'mcp://context7/project-management/status-reporting',
          'mcp://context7/agile/task-tracking',
        ],
        examples: [
          {
            description: 'Check epic status',
            input: { epicName: 'user-authentication' },
            expectedOutput: 'Quick status overview with progress and next actions',
          },
        ],
        version: '0.1.0',
      },
      async (params, context7Docs) => {
        this.logger.info(`Checking status for epic: ${params.epicName}`);

        // TODO: Implement epic status logic
        // 1. Read epic frontmatter
        // 2. Count tasks by status
        // 3. Identify blocked tasks
        // 4. Identify next actionable tasks
        // 5. Calculate velocity/progress
        // 6. Format quick status report with Context7 best practices

        const placeholder = {
          epicName: params.epicName,
          status: 'not-started',
          progress: 0,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          blockedTasks: 0,
          nextTasks: [],
          message: 'Epic status implementation in progress (Phase 1)',
        };

        return {
          content: [{
            type: 'text',
            text: `# Epic Status: ${params.epicName}\n\n` +
                  `Status: ${placeholder.status}\n` +
                  `Progress: ${placeholder.progress}%\n\n` +
                  `Tasks:\n` +
                  `- Total: ${placeholder.totalTasks}\n` +
                  `- Completed: ${placeholder.completedTasks}\n` +
                  `- In Progress: ${placeholder.inProgressTasks}\n` +
                  `- Blocked: ${placeholder.blockedTasks}\n\n` +
                  `⚠️  ${placeholder.message}`,
          }],
          structuredContent: placeholder,
        };
      }
    );
  }

  /**
   * Custom validation for PM tools
   */
  protected customValidation(name: string, metadata: any): void {
    // Ensure all PM tools have agile-related Context7 queries
    const hasAgileQuery = metadata.context7Queries.some((query: string) =>
      query.includes('agile') || query.includes('project-management')
    );

    if (!hasAgileQuery) {
      this.logger.warn(
        `PM tool ${name} should include agile or project-management Context7 queries`
      );
    }
  }
}

/**
 * Main entry point
 * Start the PM server when run directly
 */
async function main() {
  const server = new PMServer();

  try {
    await server.start();
  } catch (error) {
    console.error('Failed to start PM server:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default PMServer;
