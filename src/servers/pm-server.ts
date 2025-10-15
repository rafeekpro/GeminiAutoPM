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
import {
  initClaudeStructure,
  isClaudeInitialized,
  getPrdFilePath,
  writeFile,
  readFile,
  prdExists,
  createEpicDir,
  getEpicFilePath,
  getTaskFilePath,
  epicExists,
  listEpics,
  listTasks,
} from '../lib/file-ops.js';
import {
  createPrdFrontmatter,
  stringifyFrontmatter,
  parsePrdFrontmatter,
  createEpicFrontmatter,
  parseEpicFrontmatter,
  parseTaskFrontmatter,
} from '../lib/frontmatter.js';
import {
  logSuccess,
  logError,
  MemoryBankOperation,
  initMemoryBank,
} from '../lib/memory-bank.js';
import { sanitizeEpicName, validateEpicName } from '../lib/validation.js';

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
    this.logger.info('Initializing PM tools (Phase 1 Revised: PRD → Epic Workflow)...');

    // Phase 0: Initialization
    this.registerPMInit();           // 🆕 Initialize .claude structure

    // Phase 1: PRD Creation (PRIORITY - Entry Point)
    this.registerPRDNew();           // 🆕 Create new PRD
    this.registerPRDParse();         // 🆕 Convert PRD to Epic

    // Phase 2: Epic Management
    this.registerEpicDecompose();  // ✅ Already implemented
    this.registerEpicShow();         // 🆕 Display epic details
    this.registerEpicList();         // 🆕 List all epics
    this.registerEpicStatus();       // 🆕 Quick status overview

    // Phase 3: Epic Lifecycle (TODO)
    // this.registerEpicStart();
    // this.registerEpicClose();
    // this.registerEpicEdit();
    // this.registerEpicSync();

    // Phase 4: Issue/Task Management (TODO)
    // this.registerIssueStart();
    // this.registerIssueSync();

    const stats = this.registry.getStats();
    this.logger.info(`PM Server initialized with ${stats.totalTools} tools`);
  }

  /**
   * Register PM Init Tool
   * Initialize .claude directory structure
   */
  private registerPMInit(): void {
    this.registerTool(
      'pm_init',
      {
        name: 'pm_init',
        category: ToolCategory.PM,
        description: 'Initialize .claude directory structure for PM workflow (epics, prds, memory bank)',
        inputSchema: z.object({
          workingDir: z.string().optional().describe('Working directory (defaults to current directory)'),
        }),
        context7Queries: [
          'mcp://context7/project-management/project-setup',
          'mcp://context7/agile/workflow-initialization',
        ],
        examples: [
          {
            description: 'Initialize PM structure in current directory',
            input: {},
            expectedOutput: 'Created .claude/epics, .claude/prds, and memory_bank.md',
          },
        ],
        version: '0.1.0',
      },
      async (params) => {
        const workingDir = params.workingDir || process.cwd();

        try {
          // Check if already initialized
          const initialized = await isClaudeInitialized(workingDir);
          if (initialized) {
            await logSuccess(
              MemoryBankOperation.PM_INIT,
              'PM structure already initialized',
              { workingDir },
              workingDir
            );

            return {
              content: [{
                type: 'text',
                text: '✅ PM structure already initialized\n\n' +
                      'Directory structure:\n' +
                      '- .claude/epics/\n' +
                      '- .claude/prds/\n' +
                      '- .claude/memory_bank.md',
              }],
            };
          }

          // Initialize structure
          await initClaudeStructure(workingDir);
          await initMemoryBank(workingDir);

          await logSuccess(
            MemoryBankOperation.PM_INIT,
            'PM structure initialized successfully',
            { workingDir },
            workingDir
          );

          return {
            content: [{
              type: 'text',
              text: '✅ PM structure initialized successfully\n\n' +
                    'Created:\n' +
                    '- .claude/epics/     (for epic and task files)\n' +
                    '- .claude/prds/      (for PRD files)\n' +
                    '- .claude/memory_bank.md (audit trail)\n\n' +
                    'Next steps:\n' +
                    '1. Create a PRD: prd_new\n' +
                    '2. Convert PRD to Epic: prd_parse\n' +
                    '3. Decompose Epic into tasks: epic_decompose',
            }],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          await logError(
            MemoryBankOperation.PM_INIT,
            'Failed to initialize PM structure',
            errorMessage,
            { workingDir },
            workingDir
          );

          return {
            content: [{
              type: 'text',
              text: `❌ Failed to initialize PM structure\n\nError: ${errorMessage}`,
            }],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Register PRD New Tool
   * Create new Product Requirements Document
   */
  private registerPRDNew(): void {
    this.registerTool(
      'prd_new',
      {
        name: 'prd_new',
        category: ToolCategory.PM,
        description: 'Create new Product Requirements Document with guided template',
        inputSchema: z.object({
          featureName: z.string().min(1).describe('Feature name (kebab-case recommended)'),
          executiveSummary: z.string().min(1).describe('High-level overview of the feature'),
          problemStatement: z.string().min(1).describe('Core problem this feature solves'),
          successCriteria: z.string().min(1).describe('Measurable success outcomes'),
          userStories: z.string().min(1).describe('User stories (As a... I want... So that...)'),
          acceptanceCriteria: z.string().min(1).describe('Testable requirements'),
          outOfScope: z.string().optional().describe('What is NOT being built'),
          technicalConsiderations: z.string().optional().describe('Technical notes and constraints'),
        }),
        context7Queries: [
          'mcp://context7/product-management/prd-templates',
          'mcp://context7/product-management/requirements',
          'mcp://context7/agile/user-stories',
          'mcp://context7/product-management/success-metrics',
        ],
        examples: [
          {
            description: 'Create PRD for user authentication feature',
            input: {
              featureName: 'user-authentication',
              executiveSummary: 'Secure user authentication system with OAuth2 and JWT tokens',
              problemStatement: 'Users need secure way to access the platform',
              successCriteria: '95%+ uptime, <500ms auth response time',
              userStories: 'As a user, I want to login securely, so that my data is protected',
              acceptanceCriteria: 'Users can register, login, logout, reset password',
            },
            expectedOutput: 'PRD created at .claude/prds/user-authentication.md',
          },
        ],
        version: '0.1.0',
      },
      async (params) => {
        const featureName = sanitizeEpicName(params.featureName);

        // Validate epic name
        const validation = validateEpicName(featureName);
        if (!validation.valid) {
          return {
            content: [{
              type: 'text',
              text: `❌ Invalid feature name: ${validation.error}\n\n` +
                    `Original: ${params.featureName}\n` +
                    `Sanitized: ${featureName}\n\n` +
                    `Feature names must be lowercase alphanumeric with hyphens (e.g., user-authentication)`,
            }],
            isError: true,
          };
        }

        try {
          // Check if PRD already exists
          const exists = await prdExists(featureName);
          if (exists) {
            return {
              content: [{
                type: 'text',
                text: `⚠️  PRD already exists for feature: ${featureName}\n\n` +
                      `Location: .claude/prds/${featureName}.md\n\n` +
                      `Use prd_edit to modify existing PRD.`,
              }],
            };
          }

          // Create PRD frontmatter
          const frontmatter = createPrdFrontmatter(featureName, {
            status: 'draft',
          });

          // Build PRD content
          const prdContent = `
## Executive Summary
${params.executiveSummary}

## Problem Statement
${params.problemStatement}

## Success Criteria
${params.successCriteria}

## User Stories
${params.userStories}

## Acceptance Criteria
${params.acceptanceCriteria}

## Out of Scope
${params.outOfScope || 'To be defined during implementation planning'}

## Technical Considerations
${params.technicalConsiderations || 'To be defined during technical design phase'}

---
*Created with GeminiAutoPM MCP Server*
`;

          // Combine frontmatter and content
          const prdMarkdown = stringifyFrontmatter(frontmatter, prdContent);

          // Write PRD file
          const prdPath = getPrdFilePath(featureName);
          await writeFile(prdPath, prdMarkdown);

          // Log to memory bank
          await logSuccess(
            MemoryBankOperation.PRD_NEW,
            `Created PRD for feature: ${featureName}`,
            {
              featureName,
              status: frontmatter.status,
              sections: ['Executive Summary', 'Problem Statement', 'Success Criteria', 'User Stories', 'Acceptance Criteria'],
            }
          );

          return {
            content: [{
              type: 'text',
              text: `✅ PRD created successfully\n\n` +
                    `Feature: ${featureName}\n` +
                    `Location: .claude/prds/${featureName}.md\n` +
                    `Status: draft\n\n` +
                    `Next steps:\n` +
                    `1. Review and refine the PRD\n` +
                    `2. Convert to Epic: prd_parse ${featureName}\n` +
                    `3. Decompose into tasks: epic_decompose ${featureName}`,
            }],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          await logError(
            MemoryBankOperation.PRD_NEW,
            `Failed to create PRD for feature: ${featureName}`,
            errorMessage,
            { featureName }
          );

          return {
            content: [{
              type: 'text',
              text: `❌ Failed to create PRD\n\nError: ${errorMessage}`,
            }],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Register PRD Parse Tool
   * Convert PRD to Epic
   */
  private registerPRDParse(): void {
    this.registerTool(
      'prd_parse',
      {
        name: 'prd_parse',
        category: ToolCategory.PM,
        description: 'Convert Product Requirements Document to technical implementation epic',
        inputSchema: z.object({
          featureName: z.string().min(1).describe('Feature name matching PRD file'),
          technicalApproach: z.string().min(1).describe('Technical implementation approach and architecture'),
          implementationPhases: z.string().min(1).describe('Implementation phases and timeline'),
          dependencies: z.string().optional().describe('Technical dependencies and prerequisites'),
        }),
        context7Queries: [
          'mcp://context7/product-management/prd-to-epic',
          'mcp://context7/agile/epic-structure',
          'mcp://context7/architecture/technical-design',
          'mcp://context7/project-management/task-breakdown',
          'mcp://context7/agile/estimation',
        ],
        examples: [
          {
            description: 'Convert authentication PRD to epic',
            input: {
              featureName: 'user-authentication',
              technicalApproach: 'OAuth2 + JWT tokens, bcrypt password hashing, Redis session storage',
              implementationPhases: 'Phase 1: User registration, Phase 2: Login/logout, Phase 3: Password reset',
              dependencies: 'Redis, JWT library, OAuth2 provider integration',
            },
            expectedOutput: 'Epic created at .claude/epics/user-authentication/epic.md',
          },
        ],
        version: '0.1.0',
      },
      async (params) => {
        const featureName = sanitizeEpicName(params.featureName);

        try {
          // Check if PRD exists
          const exists = await prdExists(featureName);
          if (!exists) {
            return {
              content: [{
                type: 'text',
                text: `❌ PRD not found for feature: ${featureName}\n\n` +
                      `Expected location: .claude/prds/${featureName}.md\n\n` +
                      `Create PRD first using: prd_new`,
              }],
              isError: true,
            };
          }

          // Read PRD
          const prdPath = getPrdFilePath(featureName);
          const prdMarkdown = await readFile(prdPath);
          const prdData = parsePrdFrontmatter(prdMarkdown);

          // Create epic directory
          await createEpicDir(featureName);

          // Create epic frontmatter
          const epicFrontmatter = createEpicFrontmatter(featureName, {
            status: 'open',
            progress: 0,
          });

          // Build epic content
          const epicContent = `
## Overview
Converted from PRD: ${featureName}

## Technical Approach
${params.technicalApproach}

## Implementation Phases
${params.implementationPhases}

## Dependencies
${params.dependencies || 'None specified'}

## Success Criteria
${prdData.content.includes('## Success Criteria')
  ? prdData.content.split('## Success Criteria')[1]?.split('##')[0]?.trim()
  : 'Inherited from PRD'}

## Task Breakdown Preview
*Use epic_decompose to break down into detailed tasks*

---
*Generated from PRD by GeminiAutoPM MCP Server*
*Original PRD: .claude/prds/${featureName}.md*
`;

          // Combine frontmatter and content
          const epicMarkdown = stringifyFrontmatter(epicFrontmatter, epicContent);

          // Write epic file
          const epicPath = getEpicFilePath(featureName);
          await writeFile(epicPath, epicMarkdown);

          // Update PRD status
          // TODO: Implement PRD status update

          // Log to memory bank
          await logSuccess(
            MemoryBankOperation.PRD_PARSE,
            `Converted PRD to Epic: ${featureName}`,
            {
              featureName,
              prdFile: `prds/${featureName}.md`,
              epicFile: `epics/${featureName}/epic.md`,
            }
          );

          return {
            content: [{
              type: 'text',
              text: `✅ Epic created from PRD\n\n` +
                    `Feature: ${featureName}\n` +
                    `PRD: .claude/prds/${featureName}.md\n` +
                    `Epic: .claude/epics/${featureName}/epic.md\n\n` +
                    `Next steps:\n` +
                    `1. Review epic structure\n` +
                    `2. Decompose into tasks: epic_decompose ${featureName}\n` +
                    `3. Start implementation: epic_start ${featureName}`,
            }],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          await logError(
            MemoryBankOperation.PRD_PARSE,
            `Failed to parse PRD: ${featureName}`,
            errorMessage,
            { featureName }
          );

          return {
            content: [{
              type: 'text',
              text: `❌ Failed to convert PRD to Epic\n\nError: ${errorMessage}`,
            }],
            isError: true,
          };
        }
      }
    );
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
      async (params) => {
        const epicName = sanitizeEpicName(params.epicName);
        this.logger.info(`Showing epic: ${epicName}`);

        try {
          // Check if epic exists
          const exists = await epicExists(epicName);
          if (!exists) {
            return {
              content: [{
                type: 'text',
                text: `❌ Epic not found: ${epicName}\n\n` +
                      `Expected location: .claude/epics/${epicName}/epic.md\n\n` +
                      `Available commands:\n` +
                      `- List all epics: epic_list\n` +
                      `- Create from PRD: prd_parse ${epicName}`,
              }],
              isError: true,
            };
          }

          // Read epic file
          const epicPath = getEpicFilePath(epicName);
          const epicMarkdown = await readFile(epicPath);
          const epicData = parseEpicFrontmatter(epicMarkdown);

          // List tasks
          const taskFiles = await listTasks(epicName);
          const tasks = [];

          for (const taskFile of taskFiles) {
            const taskNumber = taskFile.replace('.md', '');
            const taskPath = getTaskFilePath(epicName, taskNumber);
            const taskMarkdown = await readFile(taskPath);
            const taskData = parseTaskFrontmatter(taskMarkdown);

            tasks.push({
              number: taskFile.replace('.md', ''),
              name: taskData.data.name,
              status: taskData.data.status,
              effort: taskData.data.effort,
              depends_on: taskData.data.depends_on,
            });
          }

          // Calculate statistics
          const totalTasks = tasks.length;
          const completedTasks = tasks.filter(t => t.status === 'completed').length;
          const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
          const blockedTasks = tasks.filter(t => t.status === 'blocked').length;

          // Format output
          let output = `# Epic: ${epicData.data.name}\n\n`;
          output += `**Status**: ${epicData.data.status}\n`;
          output += `**Progress**: ${epicData.data.progress}%\n`;
          output += `**Created**: ${new Date(epicData.data.created).toLocaleDateString()}\n`;
          output += `**Updated**: ${new Date(epicData.data.updated).toLocaleDateString()}\n\n`;

          output += `## Task Summary\n`;
          output += `- Total: ${totalTasks}\n`;
          output += `- Completed: ${completedTasks}\n`;
          output += `- In Progress: ${inProgressTasks}\n`;
          output += `- Blocked: ${blockedTasks}\n`;
          output += `- Open: ${totalTasks - completedTasks - inProgressTasks - blockedTasks}\n\n`;

          if (tasks.length > 0) {
            output += `## Tasks\n\n`;
            for (const task of tasks) {
              const statusEmoji = {
                'open': '⚪',
                'in-progress': '🔵',
                'completed': '✅',
                'blocked': '🔴',
              }[task.status] || '⚪';

              output += `${statusEmoji} **${task.number}**: ${task.name}`;
              if (task.effort) {
                output += ` [${task.effort.toUpperCase()}]`;
              }
              output += `\n`;

              if (params.verbose && task.depends_on && task.depends_on.length > 0) {
                output += `   Dependencies: ${task.depends_on.join(', ')}\n`;
              }
            }
          } else {
            output += `## Tasks\n\n`;
            output += `No tasks yet. Use \`epic_decompose ${epicName}\` to break down this epic into tasks.\n`;
          }

          output += `\n## Epic Content\n\n`;
          output += epicData.content.trim();

          return {
            content: [{
              type: 'text',
              text: output,
            }],
            structuredContent: {
              epicName: epicData.data.name,
              status: epicData.data.status,
              progress: epicData.data.progress,
              totalTasks,
              completedTasks,
              inProgressTasks,
              blockedTasks,
              tasks,
            },
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.error(`Failed to show epic: ${errorMessage}`);

          return {
            content: [{
              type: 'text',
              text: `❌ Failed to show epic: ${epicName}\n\nError: ${errorMessage}`,
            }],
            isError: true,
          };
        }
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
      async (params) => {
        const filterStatus = params.status || 'all';
        const sortBy = params.sortBy || 'name';
        this.logger.info(`Listing epics (filter: ${filterStatus}, sort: ${sortBy})`);

        try {
          // Get all epic names
          const epicNames = await listEpics();

          if (epicNames.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `# Project Epics\n\n` +
                      `No epics found.\n\n` +
                      `Create your first epic:\n` +
                      `1. Create PRD: prd_new\n` +
                      `2. Convert to Epic: prd_parse`,
              }],
            };
          }

          // Read all epic frontmatter
          const epics = [];
          for (const epicName of epicNames) {
            try {
              const epicPath = getEpicFilePath(epicName);
              const epicMarkdown = await readFile(epicPath);
              const epicData = parseEpicFrontmatter(epicMarkdown);

              // Count tasks
              const taskFiles = await listTasks(epicName);
              const totalTasks = taskFiles.length;

              epics.push({
                name: epicData.data.name,
                status: epicData.data.status,
                progress: epicData.data.progress,
                totalTasks,
                completedTasks: epicData.data.completedTasks || 0,
                created: epicData.data.created,
                updated: epicData.data.updated,
              });
            } catch (error) {
              this.logger.warn(`Failed to read epic: ${epicName} - ${error}`);
            }
          }

          // Filter by status
          let filteredEpics = epics;
          if (filterStatus !== 'all') {
            filteredEpics = epics.filter(e => e.status === filterStatus);
          }

          // Sort epics
          filteredEpics.sort((a, b) => {
            switch (sortBy) {
              case 'progress':
                return b.progress - a.progress;
              case 'created':
                return new Date(b.created).getTime() - new Date(a.created).getTime();
              case 'updated':
                return new Date(b.updated).getTime() - new Date(a.updated).getTime();
              case 'name':
              default:
                return a.name.localeCompare(b.name);
            }
          });

          // Count by status
          const byStatus = {
            open: epics.filter(e => e.status === 'open').length,
            'in-progress': epics.filter(e => e.status === 'in-progress').length,
            completed: epics.filter(e => e.status === 'completed').length,
            blocked: epics.filter(e => e.status === 'blocked').length,
          };

          // Format output
          let output = `# Project Epics\n\n`;
          output += `**Total**: ${epics.length} epics\n`;
          output += `**Filter**: ${filterStatus}\n`;
          output += `**Sort**: ${sortBy}\n\n`;

          output += `## Status Summary\n`;
          output += `- 🟢 Open: ${byStatus.open}\n`;
          output += `- 🔵 In Progress: ${byStatus['in-progress']}\n`;
          output += `- ✅ Completed: ${byStatus.completed}\n`;
          output += `- 🔴 Blocked: ${byStatus.blocked}\n\n`;

          if (filteredEpics.length > 0) {
            output += `## Epics\n\n`;
            for (const epic of filteredEpics) {
              const statusEmoji = {
                'open': '🟢',
                'in-progress': '🔵',
                'completed': '✅',
                'blocked': '🔴',
              }[epic.status] || '⚪';

              output += `${statusEmoji} **${epic.name}**\n`;
              output += `   Progress: ${epic.progress}% | Tasks: ${epic.completedTasks}/${epic.totalTasks}\n`;
              output += `   Updated: ${new Date(epic.updated).toLocaleDateString()}\n\n`;
            }
          } else {
            output += `No epics match filter: ${filterStatus}\n`;
          }

          return {
            content: [{
              type: 'text',
              text: output,
            }],
            structuredContent: {
              epics: filteredEpics,
              total: epics.length,
              filtered: filteredEpics.length,
              byStatus,
            },
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.error(`Failed to list epics: ${errorMessage}`);

          return {
            content: [{
              type: 'text',
              text: `❌ Failed to list epics\n\nError: ${errorMessage}`,
            }],
            isError: true,
          };
        }
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
      async (params) => {
        const epicName = sanitizeEpicName(params.epicName);
        this.logger.info(`Checking status for epic: ${epicName}`);

        try {
          // Check if epic exists
          const exists = await epicExists(epicName);
          if (!exists) {
            return {
              content: [{
                type: 'text',
                text: `❌ Epic not found: ${epicName}\n\n` +
                      `Expected location: .claude/epics/${epicName}/epic.md\n\n` +
                      `Use epic_list to see all available epics.`,
              }],
              isError: true,
            };
          }

          // Read epic file
          const epicPath = getEpicFilePath(epicName);
          const epicMarkdown = await readFile(epicPath);
          const epicData = parseEpicFrontmatter(epicMarkdown);

          // Read all tasks and categorize
          const taskFiles = await listTasks(epicName);
          const tasks = {
            open: [] as Array<{number: string, name: string, depends_on?: string[]}>,
            inProgress: [] as Array<{number: string, name: string}>,
            completed: [] as Array<{number: string, name: string}>,
            blocked: [] as Array<{number: string, name: string, reason?: string}>,
          };

          for (const taskFile of taskFiles) {
            try {
              const taskNumber = taskFile.replace('.md', '');
              const taskPath = getTaskFilePath(epicName, taskNumber);
              const taskMarkdown = await readFile(taskPath);
              const taskData = parseTaskFrontmatter(taskMarkdown);

              const taskInfo = {
                number: taskNumber,
                name: taskData.data.name,
                depends_on: taskData.data.depends_on,
              };

              switch (taskData.data.status) {
                case 'completed':
                  tasks.completed.push(taskInfo);
                  break;
                case 'in-progress':
                  tasks.inProgress.push(taskInfo);
                  break;
                case 'blocked':
                  tasks.blocked.push(taskInfo);
                  break;
                default:
                  tasks.open.push(taskInfo);
              }
            } catch (error) {
              this.logger.warn(`Failed to read task: ${taskFile} - ${error}`);
            }
          }

          // Find next actionable tasks (no unmet dependencies)
          const completedTaskNumbers = new Set(tasks.completed.map(t => t.number));
          const nextTasks = tasks.open.filter(task => {
            if (!task.depends_on || task.depends_on.length === 0) {
              return true;
            }
            return task.depends_on.every(dep => completedTaskNumbers.has(dep));
          });

          // Calculate statistics
          const totalTasks = taskFiles.length;
          const completedCount = tasks.completed.length;
          const inProgressCount = tasks.inProgress.length;
          const blockedCount = tasks.blocked.length;
          const openCount = tasks.open.length;

          // Format output
          let output = `# Epic Status: ${epicData.data.name}\n\n`;

          const statusEmoji = {
            'open': '🟢',
            'in-progress': '🔵',
            'completed': '✅',
            'blocked': '🔴',
          }[epicData.data.status] || '⚪';

          output += `${statusEmoji} **Status**: ${epicData.data.status}\n`;
          output += `📊 **Progress**: ${epicData.data.progress}%\n`;
          output += `📅 **Updated**: ${new Date(epicData.data.updated).toLocaleDateString()}\n\n`;

          output += `## Task Breakdown\n`;
          output += `- ✅ Completed: ${completedCount}\n`;
          output += `- 🔵 In Progress: ${inProgressCount}\n`;
          output += `- ⚪ Open: ${openCount}\n`;
          output += `- 🔴 Blocked: ${blockedCount}\n`;
          output += `- 📦 Total: ${totalTasks}\n\n`;

          if (blockedCount > 0) {
            output += `## ⚠️  Blocked Tasks\n`;
            for (const task of tasks.blocked) {
              output += `- **${task.number}**: ${task.name}\n`;
            }
            output += `\n`;
          }

          if (inProgressCount > 0) {
            output += `## 🔵 In Progress\n`;
            for (const task of tasks.inProgress) {
              output += `- **${task.number}**: ${task.name}\n`;
            }
            output += `\n`;
          }

          if (nextTasks.length > 0) {
            output += `## 🎯 Next Actions (Ready to Start)\n`;
            for (const task of nextTasks.slice(0, 5)) {
              output += `- **${task.number}**: ${task.name}`;
              if (task.depends_on && task.depends_on.length > 0) {
                output += ` (deps: ${task.depends_on.join(', ')})`;
              }
              output += `\n`;
            }
            if (nextTasks.length > 5) {
              output += `\n*... and ${nextTasks.length - 5} more*\n`;
            }
          } else if (openCount > 0) {
            output += `## ⏸️  Waiting on Dependencies\n`;
            output += `All open tasks have unmet dependencies.\n`;
          }

          if (completedCount === totalTasks && totalTasks > 0) {
            output += `\n🎉 **All tasks completed!** Consider closing this epic.\n`;
          }

          return {
            content: [{
              type: 'text',
              text: output,
            }],
            structuredContent: {
              epicName: epicData.data.name,
              status: epicData.data.status,
              progress: epicData.data.progress,
              totalTasks,
              completedTasks: completedCount,
              inProgressTasks: inProgressCount,
              blockedTasks: blockedCount,
              openTasks: openCount,
              nextTasks: nextTasks.map(t => ({ number: t.number, name: t.name })),
            },
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.error(`Failed to get epic status: ${errorMessage}`);

          return {
            content: [{
              type: 'text',
              text: `❌ Failed to get epic status: ${epicName}\n\nError: ${errorMessage}`,
            }],
            isError: true,
          };
        }
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
