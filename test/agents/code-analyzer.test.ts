/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from '@jest/globals';
import { executeCodeAnalyzer, codeAnalyzerConfig } from '../../src/agents/code-analyzer.js';

describe('Code Analyzer Agent', () => {
  describe('Configuration', () => {
    it('should have required metadata', () => {
      expect(codeAnalyzerConfig.name).toBe('code-analyzer');
      expect(codeAnalyzerConfig.description).toBeTruthy();
      expect(codeAnalyzerConfig.capabilities).toBeInstanceOf(Array);
      expect(codeAnalyzerConfig.capabilities.length).toBeGreaterThan(0);
    });

    it('should include Context7 documentation queries', () => {
      expect(codeAnalyzerConfig.documentation).toBeDefined();
      expect(codeAnalyzerConfig.documentation?.queries).toBeInstanceOf(Array);
      expect(codeAnalyzerConfig.documentation?.queries.length).toBeGreaterThan(0);
    });

    it('should have context instructions', () => {
      expect(codeAnalyzerConfig.context).toBeTruthy();
      expect(codeAnalyzerConfig.context).toContain('Code Analyzer');
    });
  });

  describe('Execution', () => {
    it('should execute successfully with minimal params', async () => {
      const result = await executeCodeAnalyzer({
        task: 'Analyze authentication module for security issues',
      });

      expect(result.success).toBe(true);
      expect(result.content).toBeTruthy();
      expect(result.metadata?.agent).toBe('code-analyzer');
      expect(result.metadata?.timestamp).toBeTruthy();
    });

    it('should include task in prompt', async () => {
      const task = 'Review login function for SQL injection';
      const result = await executeCodeAnalyzer({ task });

      expect(result.success).toBe(true);
      expect(result.content).toContain(task);
    });

    it('should include scope when provided', async () => {
      const result = await executeCodeAnalyzer({
        task: 'Analyze code',
        scope: 'security',
      });

      expect(result.success).toBe(true);
      expect(result.content).toContain('security');
    });

    it('should include files when provided', async () => {
      const files = ['src/auth.ts', 'src/login.ts'];
      const result = await executeCodeAnalyzer({
        task: 'Analyze authentication',
        options: { files },
      });

      expect(result.success).toBe(true);
      expect(result.content).toContain('src/auth.ts');
      expect(result.content).toContain('src/login.ts');
    });

    it('should include agent context in prompt', async () => {
      const result = await executeCodeAnalyzer({
        task: 'Analyze code quality',
      });

      expect(result.success).toBe(true);
      expect(result.content).toContain('Code Analyzer Agent');
      expect(result.content).toContain('Core Responsibilities');
    });

    it('should include execution metadata', async () => {
      const result = await executeCodeAnalyzer({
        task: 'Test task',
      });

      expect(result.metadata).toBeDefined();
      expect(result.metadata?.agent).toBe('code-analyzer');
      expect(result.metadata?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result.metadata?.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle execution errors gracefully', async () => {
      // Force an error by passing invalid options
      const result = await executeCodeAnalyzer({
        task: 'Test',
        options: {
          invalid: (() => {
            throw new Error('Test error');
          }) as any,
        },
      });

      // Should still succeed with prompt generation
      expect(result.success).toBe(true);
    });
  });
});
