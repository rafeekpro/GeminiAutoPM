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
   */
  protected initializeTools(): void {
    this.registerEpicDecompose();
    // Future tools will be added here:
    // this.registerTaskBreakdown();
    // this.registerSprintPlanning();
    // this.registerBacklogRefinement();
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
