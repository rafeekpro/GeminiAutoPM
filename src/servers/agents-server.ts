#!/usr/bin/env node
/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import { z } from 'zod';
import { BaseMCPServer, type ServerConfig } from './base-server.js';
import { ToolCategory } from '../registry/tool-registry.js';
import {
  codeAnalyzerConfig,
  executeCodeAnalyzer,
} from '../agents/code-analyzer.js';
import {
  testRunnerConfig,
  executeTestRunner,
} from '../agents/test-runner.js';
import {
  agentManagerConfig,
  executeAgentManager,
} from '../agents/agent-manager.js';

/**
 * Agents MCP Server
 * Provides AI-powered agent tools for code analysis, testing, and management
 *
 * Refactored to use BaseMCPServer following Context7 best practices:
 * - Automatic Context7 integration
 * - Tool registry management
 * - Comprehensive logging
 * - Error handling
 */
export class AgentsServer extends BaseMCPServer {
  constructor(config?: Partial<ServerConfig>) {
    super({
      name: 'autopm-agents',
      version: '0.1.0',
      enableContext7: true,
      ...config,
    });

    // Initialize all agent tools
    this.initializeTools();
  }

  /**
   * Initialize core agent tools
   */
  protected initializeTools(): void {
    this.registerCodeAnalyzer();
    this.registerTestRunner();
    this.registerAgentManager();
  }

  /**
   * Register code analyzer tool
   */
  private registerCodeAnalyzer(): void {
    this.registerTool(
      'code_analyzer',
      {
        name: 'code_analyzer',
        category: ToolCategory.AGENT,
        description: codeAnalyzerConfig.description,
        inputSchema: z.object({
          task: z.string().min(1).describe('The code analysis task to perform'),
          scope: z.string().optional().describe('Analysis scope (e.g., security, performance, bugs)'),
          files: z.array(z.string()).optional().describe('Specific files to analyze'),
        }),
        context7Queries: codeAnalyzerConfig.documentation?.queries || [],
        examples: [
          {
            description: 'Analyze authentication module for security vulnerabilities',
            input: {
              task: 'Review authentication module for security issues',
              scope: 'security',
              files: ['src/auth/login.ts', 'src/auth/session.ts'],
            },
            expectedOutput: 'Detailed security analysis with vulnerability report',
          },
        ],
        version: '0.1.0',
      },
      async (params, context7Docs) => {
        const result = await executeCodeAnalyzer({
          task: params.task,
          scope: params.scope,
          options: { files: params.files },
        });

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`,
            }],
            isError: true,
          };
        }

        return {
          content: [{
            type: 'text',
            text: result.content,
          }],
        };
      }
    );
  }

  /**
   * Register test runner tool
   */
  private registerTestRunner(): void {
    this.registerTool(
      'test_runner',
      {
        name: 'test_runner',
        category: ToolCategory.AGENT,
        description: testRunnerConfig.description,
        inputSchema: z.object({
          task: z.string().min(1).describe('The test execution task'),
          scope: z.string().optional().describe('Test scope (e.g., unit, integration, e2e)'),
          testPattern: z.string().optional().describe('Test file pattern to execute'),
          framework: z.string().optional().describe('Test framework (jest, mocha, pytest, etc.)'),
        }),
        context7Queries: testRunnerConfig.documentation?.queries || [],
        examples: [
          {
            description: 'Run all unit tests and analyze failures',
            input: {
              task: 'Execute all unit tests and analyze failures',
              scope: 'unit',
              framework: 'jest',
            },
            expectedOutput: 'Test execution report with failure analysis',
          },
        ],
        version: '0.1.0',
      },
      async (params, context7Docs) => {
        const result = await executeTestRunner({
          task: params.task,
          scope: params.scope,
          options: {
            testPattern: params.testPattern,
            framework: params.framework,
          },
        });

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`,
            }],
            isError: true,
          };
        }

        return {
          content: [{
            type: 'text',
            text: result.content,
          }],
        };
      }
    );
  }

  /**
   * Register agent manager tool
   */
  private registerAgentManager(): void {
    this.registerTool(
      'agent_manager',
      {
        name: 'agent_manager',
        category: ToolCategory.AGENT,
        description: agentManagerConfig.description,
        inputSchema: z.object({
          task: z.string().min(1).describe('The agent management task (create, analyze, update, etc.)'),
          scope: z.string().optional().describe('Management scope'),
          agentType: z.string().optional().describe('Type of agent/tool to manage'),
          capabilities: z.array(z.string()).optional().describe('Required capabilities'),
        }),
        context7Queries: agentManagerConfig.documentation?.queries || [],
        examples: [
          {
            description: 'Create a new MCP tool for GraphQL development',
            input: {
              task: 'Create a new MCP tool for GraphQL API development',
              agentType: 'graphql-specialist',
              capabilities: ['schema design', 'resolver implementation', 'query optimization'],
            },
            expectedOutput: 'Complete MCP tool implementation with tests',
          },
        ],
        version: '0.1.0',
      },
      async (params, context7Docs) => {
        const result = await executeAgentManager({
          task: params.task,
          scope: params.scope,
          options: {
            agentType: params.agentType,
            capabilities: params.capabilities,
          },
        });

        if (!result.success) {
          return {
            content: [{
              type: 'text',
              text: `Error: ${result.error}`,
            }],
            isError: true,
          };
        }

        return {
          content: [{
            type: 'text',
            text: result.content,
          }],
        };
      }
    );
  }
}

/**
 * Main entry point
 * Start the agents server when run directly
 */
async function main() {
  const server = new AgentsServer();

  try {
    await server.start();
  } catch (error) {
    console.error('Failed to start agents server:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default AgentsServer;
