/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import type { AgentConfig, AgentResult, AgentToolParams } from '../types/agent.js';

export const testRunnerConfig: AgentConfig = {
  name: 'test-runner',
  description: 'Execute tests and provide comprehensive failure analysis with actionable insights',
  capabilities: [
    'Test execution and monitoring',
    'Failure analysis and root cause identification',
    'Test coverage assessment',
    'Performance benchmarking',
    'Regression detection',
  ],
  context: `
# Test Runner Agent

You are an expert test automation engineer specializing in test execution and analysis.

## Core Responsibilities
- **Test Execution**: Run tests using appropriate frameworks (Jest, Mocha, Pytest, etc.)
- **Failure Analysis**: Deep-dive into test failures, identify root causes
- **Coverage Analysis**: Assess test coverage, identify gaps
- **Performance**: Track test execution times, identify slow tests
- **Regression Detection**: Compare current results with baseline

## Test Execution Approach
1. Identify test framework and configuration
2. Execute tests with appropriate options
3. Capture detailed output and logs
4. Analyze failures systematically
5. Provide actionable remediation steps

## Failure Analysis Process
- **Categorize Failures**: Unit, integration, e2e, performance
- **Root Cause Analysis**: Trace stack traces, identify actual vs expected
- **Environment Factors**: Check dependencies, configs, data setup
- **Regression Check**: Compare with previous test runs
- **Fix Suggestions**: Provide specific code changes

## Output Format
- **Summary**: Overall test results (passed/failed/skipped)
- **Failed Tests**: Detailed analysis of each failure
- **Coverage Report**: Coverage metrics and gaps
- **Performance**: Execution time analysis
- **Recommendations**: Specific fixes with code examples

## Best Practices
- Run tests in isolation when possible
- Capture full stack traces and logs
- Identify patterns in failures
- Suggest preventive measures
- Prioritize critical failures
`,
  documentation: {
    queries: [
      'mcp://context7/testing/test-frameworks',
      'mcp://context7/testing/jest',
      'mcp://context7/testing/test-analysis',
      'mcp://context7/ci-cd/testing-strategies',
    ],
    why: 'Ensures test execution follows framework best practices and industry standards',
  },
};

export async function executeTestRunner(params: AgentToolParams): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const prompt = buildTestPrompt(params);

    return {
      success: true,
      content: prompt,
      metadata: {
        agent: 'test-runner',
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
        agent: 'test-runner',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      },
    };
  }
}

function buildTestPrompt(params: AgentToolParams): string {
  const { task, scope, options } = params;

  let prompt = `${testRunnerConfig.context}\n\n`;
  prompt += `## Test Execution Task\n${task}\n\n`;

  if (scope) {
    prompt += `## Test Scope\n${scope}\n\n`;
  }

  if (options?.testPattern) {
    prompt += `## Test Pattern\n${options.testPattern}\n\n`;
  }

  if (options?.framework) {
    prompt += `## Test Framework\n${options.framework}\n\n`;
  }

  prompt += `## Required Actions\n`;
  prompt += `1. Execute the specified tests\n`;
  prompt += `2. Capture and analyze all output\n`;
  prompt += `3. Identify failed tests and root causes\n`;
  prompt += `4. Assess test coverage if applicable\n`;
  prompt += `5. Provide detailed remediation steps\n`;
  prompt += `6. Suggest preventive measures\n\n`;

  prompt += `Begin test execution and analysis now.`;

  return prompt;
}
