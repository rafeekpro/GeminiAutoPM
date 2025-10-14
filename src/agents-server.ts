#!/usr/bin/env node
/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import {
  codeAnalyzerConfig,
  executeCodeAnalyzer,
} from './agents/code-analyzer.js';
import {
  testRunnerConfig,
  executeTestRunner,
} from './agents/test-runner.js';
import {
  agentManagerConfig,
  executeAgentManager,
} from './agents/agent-manager.js';

/**
 * AutoPM Agents MCP Server
 * Provides AI-powered agent tools for code analysis, testing, and management
 */
const server = new McpServer({
  name: 'autopm-agents',
  version: '0.1.0',
});

// ============================================================================
// Code Analyzer Tool
// ============================================================================
server.registerTool(
  'code_analyzer',
  {
    description: codeAnalyzerConfig.description,
    inputSchema: z.object({
      task: z.string().describe('The code analysis task to perform'),
      scope: z.string().optional().describe('Analysis scope (e.g., security, performance, bugs)'),
      files: z.array(z.string()).optional().describe('Specific files to analyze'),
    }).shape,
  },
  async (params) => {
    const result = await executeCodeAnalyzer({
      task: params.task,
      scope: params.scope,
      options: { files: params.files },
    });

    if (!result.success) {
      throw new Error(result.error || 'Code analysis failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.content,
        },
      ],
    };
  }
);

// ============================================================================
// Test Runner Tool
// ============================================================================
server.registerTool(
  'test_runner',
  {
    description: testRunnerConfig.description,
    inputSchema: z.object({
      task: z.string().describe('The test execution task'),
      scope: z.string().optional().describe('Test scope (e.g., unit, integration, e2e)'),
      testPattern: z.string().optional().describe('Test file pattern to execute'),
      framework: z.string().optional().describe('Test framework (jest, mocha, pytest, etc.)'),
    }).shape,
  },
  async (params) => {
    const result = await executeTestRunner({
      task: params.task,
      scope: params.scope,
      options: {
        testPattern: params.testPattern,
        framework: params.framework,
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Test execution failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.content,
        },
      ],
    };
  }
);

// ============================================================================
// Agent Manager Tool
// ============================================================================
server.registerTool(
  'agent_manager',
  {
    description: agentManagerConfig.description,
    inputSchema: z.object({
      task: z.string().describe('The agent management task (create, analyze, update, etc.)'),
      scope: z.string().optional().describe('Management scope'),
      agentType: z.string().optional().describe('Type of agent/tool to manage'),
      capabilities: z.array(z.string()).optional().describe('Required capabilities'),
    }).shape,
  },
  async (params) => {
    const result = await executeAgentManager({
      task: params.task,
      scope: params.scope,
      options: {
        agentType: params.agentType,
        capabilities: params.capabilities,
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Agent management failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.content,
        },
      ],
    };
  }
);

// ============================================================================
// Server Startup
// ============================================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP protocol)
  console.error('AutoPM Agents MCP Server started successfully');
  console.error('Registered tools: code_analyzer, test_runner, agent_manager');
}

main().catch((error) => {
  console.error('Failed to start AutoPM Agents server:', error);
  process.exit(1);
});
