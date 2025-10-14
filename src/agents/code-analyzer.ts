/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import type { AgentConfig, AgentResult, AgentToolParams } from '../types/agent.js';

export const codeAnalyzerConfig: AgentConfig = {
  name: 'code-analyzer',
  description: 'Deep-dive code analysis for bugs, logic flow tracing, and vulnerability detection',
  capabilities: [
    'Bug detection and analysis',
    'Logic flow tracing across multiple files',
    'Security vulnerability scanning',
    'Performance optimization suggestions',
    'Code quality assessment',
  ],
  context: `
# Code Analyzer Agent

You are an expert code analyzer specializing in bug detection and security analysis.

## Core Responsibilities
- **Bug Detection**: Trace logic flows, identify potential bugs, analyze error patterns
- **Security Analysis**: Scan for vulnerabilities, detect security anti-patterns
- **Performance**: Identify bottlenecks, suggest optimizations
- **Code Quality**: Assess maintainability, readability, and best practices adherence

## Analysis Approach
1. Start with high-level architecture understanding
2. Trace critical paths and data flows
3. Identify edge cases and error conditions
4. Check for common vulnerability patterns
5. Provide actionable recommendations

## Output Format
- **Summary**: Brief overview of findings (2-3 sentences)
- **Critical Issues**: High-priority bugs or vulnerabilities
- **Warnings**: Medium-priority concerns
- **Suggestions**: Optimization and improvement opportunities
- **Code References**: Specific file:line locations

## Best Practices
- Focus on impact and severity
- Provide code examples for fixes
- Reference security standards (OWASP, CWE)
- Keep analysis concise but thorough
`,
  documentation: {
    queries: [
      'mcp://context7/security/code-analysis',
      'mcp://context7/security/vulnerability-scanning',
      'mcp://context7/code-quality/static-analysis',
    ],
    why: 'Ensures analysis follows current security standards and best practices',
  },
};

export async function executeCodeAnalyzer(params: AgentToolParams): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    // Build the prompt for code analysis
    const prompt = buildAnalysisPrompt(params);

    return {
      success: true,
      content: prompt,
      metadata: {
        agent: 'code-analyzer',
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
        agent: 'code-analyzer',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      },
    };
  }
}

function buildAnalysisPrompt(params: AgentToolParams): string {
  const { task, scope, options } = params;

  let prompt = `${codeAnalyzerConfig.context}\n\n`;
  prompt += `## Analysis Task\n${task}\n\n`;

  if (scope) {
    prompt += `## Analysis Scope\n${scope}\n\n`;
  }

  if (options?.files) {
    prompt += `## Files to Analyze\n`;
    const files = Array.isArray(options.files) ? options.files : [options.files];
    files.forEach((file) => {
      prompt += `- ${file}\n`;
    });
    prompt += `\n`;
  }

  prompt += `## Required Actions\n`;
  prompt += `1. Review the code thoroughly\n`;
  prompt += `2. Identify bugs, vulnerabilities, and performance issues\n`;
  prompt += `3. Provide specific file:line references\n`;
  prompt += `4. Suggest concrete fixes with code examples\n`;
  prompt += `5. Prioritize findings by severity\n\n`;

  prompt += `Begin your analysis now.`;

  return prompt;
}
