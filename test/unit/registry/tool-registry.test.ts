/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { z } from 'zod';
import {
  ToolRegistry,
  ToolCategory,
  type ToolMetadata,
  type RegistryStats,
} from '../../../src/registry/tool-registry.js';
import { Logger, LogLevel } from '../../../src/utils/logger.js';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;
  let logger: Logger;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  // Sample tool metadata for testing
  const sampleTool: ToolMetadata = {
    name: 'test_tool',
    category: ToolCategory.AGENT,
    description: 'Test tool for unit testing',
    inputSchema: z.object({
      input: z.string(),
    }),
    context7Queries: ['mcp://context7/testing/unit-tests'],
    examples: [
      {
        description: 'Example usage',
        input: { input: 'test' },
        expectedOutput: 'Success',
      },
    ],
    version: '1.0.0',
  };

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logger = new Logger({
      name: 'test',
      level: LogLevel.ERROR,
      enableColors: false,
    });
    registry = new ToolRegistry(logger);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    registry.clear(); // Clean up after each test
  });

  describe('Registration', () => {
    it('should register a valid tool', () => {
      registry.register('test_tool', sampleTool);

      expect(registry.has('test_tool')).toBe(true);
      const tool = registry.get('test_tool');
      expect(tool).toBeDefined();
      expect(tool?.name).toBe('test_tool');
    });

    it('should throw error when registering duplicate tool', () => {
      registry.register('test_tool', sampleTool);

      expect(() => {
        registry.register('test_tool', sampleTool);
      }).toThrow('Tool test_tool already registered');
    });

    it('should register multiple tools', () => {
      const tool1 = { ...sampleTool, name: 'tool1' };
      const tool2 = { ...sampleTool, name: 'tool2', category: ToolCategory.PM };

      registry.register('tool1', tool1);
      registry.register('tool2', tool2);

      expect(registry.has('tool1')).toBe(true);
      expect(registry.has('tool2')).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should reject tool without name', () => {
      const invalid = { ...sampleTool, name: '' };

      expect(() => {
        registry.register('invalid', invalid);
      }).toThrow('Tool name is required');
    });

    it('should reject tool without description', () => {
      const invalid = { ...sampleTool, description: '' };

      expect(() => {
        registry.register('invalid', invalid);
      }).toThrow('Tool description is required');
    });

    it('should reject tool without input schema', () => {
      const invalid = { ...sampleTool, inputSchema: undefined as any };

      expect(() => {
        registry.register('invalid', invalid);
      }).toThrow('Tool input schema is required');
    });

    it('should reject tool without Context7 queries', () => {
      const invalid = { ...sampleTool, context7Queries: [] };

      expect(() => {
        registry.register('invalid', invalid);
      }).toThrow('At least one Context7 query is required');
    });

    it('should reject tool with invalid Context7 query format', () => {
      const invalid = {
        ...sampleTool,
        context7Queries: ['https://wrong-format/docs'],
      };

      expect(() => {
        registry.register('invalid', invalid);
      }).toThrow('Invalid Context7 query format');
    });

    it('should reject tool without version', () => {
      const invalid = { ...sampleTool, version: '' };

      expect(() => {
        registry.register('invalid', invalid);
      }).toThrow('Tool version is required');
    });

    it('should reject tool without category', () => {
      const invalid = { ...sampleTool, category: undefined as any };

      expect(() => {
        registry.register('invalid', invalid);
      }).toThrow('Tool category is required');
    });

    it('should accept valid Context7 query formats', () => {
      const tool = {
        ...sampleTool,
        context7Queries: [
          'mcp://context7/security/authentication',
          'mcp://context7/agile/epic-decomposition',
          'mcp://context7/typescript/best-practices',
        ],
      };

      expect(() => {
        registry.register('valid_tool', tool);
      }).not.toThrow();
    });
  });

  describe('Retrieval', () => {
    beforeEach(() => {
      const agentTool = { ...sampleTool, name: 'agent_tool', category: ToolCategory.AGENT };
      const pmTool = { ...sampleTool, name: 'pm_tool', category: ToolCategory.PM };
      const securityTool = { ...sampleTool, name: 'security_tool', category: ToolCategory.SECURITY };

      registry.register('agent_tool', agentTool);
      registry.register('pm_tool', pmTool);
      registry.register('security_tool', securityTool);
    });

    it('should get tool by name', () => {
      const tool = registry.get('agent_tool');

      expect(tool).toBeDefined();
      expect(tool?.name).toBe('agent_tool');
      expect(tool?.category).toBe(ToolCategory.AGENT);
    });

    it('should return undefined for non-existent tool', () => {
      const tool = registry.get('non_existent');

      expect(tool).toBeUndefined();
    });

    it('should get all tools', () => {
      const all = registry.getAll();

      expect(all.length).toBe(3);
      expect(all.map(t => t.name)).toContain('agent_tool');
      expect(all.map(t => t.name)).toContain('pm_tool');
      expect(all.map(t => t.name)).toContain('security_tool');
    });

    it('should get tools by category', () => {
      const agentTools = registry.getByCategory(ToolCategory.AGENT);

      expect(agentTools.length).toBe(1);
      expect(agentTools[0].name).toBe('agent_tool');
    });

    it('should return empty array for category with no tools', () => {
      const devopsTools = registry.getByCategory(ToolCategory.DEVOPS);

      expect(devopsTools).toEqual([]);
    });

    it('should check if tool exists', () => {
      expect(registry.has('agent_tool')).toBe(true);
      expect(registry.has('non_existent')).toBe(false);
    });
  });

  describe('Updates', () => {
    beforeEach(() => {
      registry.register('test_tool', sampleTool);
    });

    it('should update tool metadata', () => {
      registry.update('test_tool', {
        description: 'Updated description',
        version: '2.0.0',
      });

      const tool = registry.get('test_tool');
      expect(tool?.description).toBe('Updated description');
      expect(tool?.version).toBe('2.0.0');
      expect(tool?.name).toBe('test_tool'); // Unchanged
    });

    it('should throw error when updating non-existent tool', () => {
      expect(() => {
        registry.update('non_existent', { description: 'New' });
      }).toThrow('Tool non_existent not found');
    });

    it('should validate updated metadata', () => {
      expect(() => {
        registry.update('test_tool', {
          description: '', // Invalid
        });
      }).toThrow('Tool description is required');
    });

    it('should preserve existing fields when updating', () => {
      registry.update('test_tool', {
        version: '2.0.0',
      });

      const tool = registry.get('test_tool');
      expect(tool?.description).toBe(sampleTool.description); // Unchanged
      expect(tool?.category).toBe(sampleTool.category); // Unchanged
      expect(tool?.version).toBe('2.0.0'); // Updated
    });
  });

  describe('Deprecation', () => {
    beforeEach(() => {
      registry.register('old_tool', { ...sampleTool, name: 'old_tool' });
      registry.register('new_tool', { ...sampleTool, name: 'new_tool' });
    });

    it('should mark tool as deprecated', () => {
      registry.deprecate('old_tool');

      const tool = registry.get('old_tool');
      expect(tool?.deprecated).toBe(true);
    });

    it('should mark tool as deprecated with replacement', () => {
      registry.deprecate('old_tool', 'new_tool');

      const tool = registry.get('old_tool');
      expect(tool?.deprecated).toBe(true);
      expect(tool?.replacedBy).toBe('new_tool');
    });

    it('should throw error when deprecating non-existent tool', () => {
      expect(() => {
        registry.deprecate('non_existent');
      }).toThrow('Tool non_existent not found');
    });

    it('should exclude deprecated tools from category queries', () => {
      registry.deprecate('old_tool');

      const agentTools = registry.getByCategory(ToolCategory.AGENT);

      expect(agentTools.length).toBe(1);
      expect(agentTools[0].name).toBe('new_tool');
    });

    it('should still retrieve deprecated tool directly', () => {
      registry.deprecate('old_tool');

      const tool = registry.get('old_tool');
      expect(tool).toBeDefined();
      expect(tool?.deprecated).toBe(true);
    });
  });

  describe('Removal', () => {
    beforeEach(() => {
      registry.register('test_tool', sampleTool);
    });

    it('should remove tool from registry', () => {
      registry.remove('test_tool');

      expect(registry.has('test_tool')).toBe(false);
      expect(registry.get('test_tool')).toBeUndefined();
    });

    it('should throw error when removing non-existent tool', () => {
      expect(() => {
        registry.remove('non_existent');
      }).toThrow('Tool non_existent not found');
    });

    it('should update stats after removal', () => {
      let stats = registry.getStats();
      expect(stats.totalTools).toBe(1);

      registry.remove('test_tool');

      stats = registry.getStats();
      expect(stats.totalTools).toBe(0);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      registry.register('agent1', { ...sampleTool, name: 'agent1', category: ToolCategory.AGENT });
      registry.register('agent2', { ...sampleTool, name: 'agent2', category: ToolCategory.AGENT });
      registry.register('pm1', { ...sampleTool, name: 'pm1', category: ToolCategory.PM });
      registry.register('security1', { ...sampleTool, name: 'security1', category: ToolCategory.SECURITY });
    });

    it('should provide accurate registry statistics', () => {
      const stats = registry.getStats();

      expect(stats.totalTools).toBe(4);
      expect(stats.byCategory.get(ToolCategory.AGENT)).toBe(2);
      expect(stats.byCategory.get(ToolCategory.PM)).toBe(1);
      expect(stats.byCategory.get(ToolCategory.SECURITY)).toBe(1);
      expect(stats.deprecated).toBe(0);
    });

    it('should track deprecated tools in stats', () => {
      registry.deprecate('agent1');
      registry.deprecate('pm1');

      const stats = registry.getStats();

      expect(stats.deprecated).toBe(2);
      expect(stats.totalTools).toBe(4); // Still counts deprecated tools
    });

    it('should return empty stats for empty registry', () => {
      const emptyRegistry = new ToolRegistry();
      const stats = emptyRegistry.getStats();

      expect(stats.totalTools).toBe(0);
      expect(stats.byCategory.size).toBe(0);
      expect(stats.deprecated).toBe(0);
    });
  });

  describe('Documentation Generation', () => {
    beforeEach(() => {
      const agentTool: ToolMetadata = {
        name: 'code_analyzer',
        category: ToolCategory.AGENT,
        description: 'Analyzes code for issues',
        inputSchema: z.object({ code: z.string() }),
        context7Queries: ['mcp://context7/security/code-analysis'],
        examples: [
          {
            description: 'Analyze TypeScript code',
            input: { code: 'const x = 1;' },
            expectedOutput: 'Analysis report',
          },
        ],
        version: '1.0.0',
      };

      const pmTool: ToolMetadata = {
        name: 'epic_decompose',
        category: ToolCategory.PM,
        description: 'Decomposes epics into user stories',
        inputSchema: z.object({ epic: z.string() }),
        context7Queries: [
          'mcp://context7/agile/epic-decomposition',
          'mcp://context7/agile/user-stories',
        ],
        examples: [],
        version: '1.0.0',
      };

      registry.register('code_analyzer', agentTool);
      registry.register('epic_decompose', pmTool);
    });

    it('should generate markdown documentation', () => {
      const docs = registry.generateDocs();

      expect(docs).toContain('# Available Tools');
      expect(docs).toContain('## agent');
      expect(docs).toContain('## project-management');
      expect(docs).toContain('### code_analyzer');
      expect(docs).toContain('### epic_decompose');
    });

    it('should include tool descriptions', () => {
      const docs = registry.generateDocs();

      expect(docs).toContain('Analyzes code for issues');
      expect(docs).toContain('Decomposes epics into user stories');
    });

    it('should include Context7 queries', () => {
      const docs = registry.generateDocs();

      expect(docs).toContain('Context7 Documentation Queries');
      expect(docs).toContain('mcp://context7/security/code-analysis');
      expect(docs).toContain('mcp://context7/agile/epic-decomposition');
    });

    it('should include examples when present', () => {
      const docs = registry.generateDocs();

      expect(docs).toContain('Examples:');
      expect(docs).toContain('Analyze TypeScript code');
      expect(docs).toContain('"code": "const x = 1;"');
    });

    it('should mark deprecated tools', () => {
      registry.deprecate('code_analyzer', 'new_analyzer');

      const docs = registry.generateDocs();

      expect(docs).toContain('⚠️ DEPRECATED');
      expect(docs).toContain('Use `new_analyzer` instead');
    });

    it('should include version information', () => {
      const docs = registry.generateDocs();

      expect(docs).toContain('**Version:** 1.0.0');
    });

    it('should return minimal docs for empty registry', () => {
      const emptyRegistry = new ToolRegistry();
      const docs = emptyRegistry.generateDocs();

      expect(docs).toBe('# Available Tools\n\n');
    });
  });

  describe('Clear Registry', () => {
    beforeEach(() => {
      registry.register('tool1', { ...sampleTool, name: 'tool1' });
      registry.register('tool2', { ...sampleTool, name: 'tool2' });
      registry.register('tool3', { ...sampleTool, name: 'tool3' });
    });

    it('should clear all tools', () => {
      let stats = registry.getStats();
      expect(stats.totalTools).toBe(3);

      registry.clear();

      stats = registry.getStats();
      expect(stats.totalTools).toBe(0);
      expect(registry.has('tool1')).toBe(false);
    });

    it('should allow registration after clear', () => {
      registry.clear();

      registry.register('new_tool', sampleTool);

      expect(registry.has('new_tool')).toBe(true);
    });
  });

  describe('Logger Integration', () => {
    it('should work without logger', () => {
      const noLogRegistry = new ToolRegistry();

      expect(() => {
        noLogRegistry.register('test', sampleTool);
      }).not.toThrow();
    });

    it('should log registration when logger present', () => {
      const loggerWithInfo = new Logger({
        name: 'test',
        level: LogLevel.INFO,
        enableColors: false,
      });

      const logRegistry = new ToolRegistry(loggerWithInfo);

      logRegistry.register('test_tool', sampleTool);

      // Should have logged to console.error (stderr)
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log warnings for deprecation', () => {
      const loggerWithWarn = new Logger({
        name: 'test',
        level: LogLevel.WARN,
        enableColors: false,
      });

      const logRegistry = new ToolRegistry(loggerWithWarn);
      logRegistry.register('old_tool', sampleTool);

      logRegistry.deprecate('old_tool', 'new_tool');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle tool names with special characters', () => {
      const tool = { ...sampleTool, name: 'test-tool_v2.0' };

      expect(() => {
        registry.register('test-tool_v2.0', tool);
      }).not.toThrow();

      expect(registry.has('test-tool_v2.0')).toBe(true);
    });

    it('should handle long descriptions', () => {
      const longDesc = 'a'.repeat(1000);
      const tool = { ...sampleTool, description: longDesc };

      registry.register('long_desc_tool', tool);

      const retrieved = registry.get('long_desc_tool');
      expect(retrieved?.description).toBe(longDesc);
    });

    it('should handle multiple Context7 queries', () => {
      const tool = {
        ...sampleTool,
        context7Queries: [
          'mcp://context7/security/authentication',
          'mcp://context7/security/authorization',
          'mcp://context7/security/encryption',
          'mcp://context7/best-practices/security',
        ],
      };

      expect(() => {
        registry.register('multi_query_tool', tool);
      }).not.toThrow();
    });

    it('should handle complex Zod schemas', () => {
      const complexSchema = z.object({
        name: z.string().min(1),
        options: z.object({
          verbose: z.boolean().optional(),
          timeout: z.number().positive(),
        }),
        tags: z.array(z.string()),
      });

      const tool = { ...sampleTool, inputSchema: complexSchema };

      expect(() => {
        registry.register('complex_tool', tool);
      }).not.toThrow();
    });

    it('should maintain tool order within categories', () => {
      registry.register('zebra', { ...sampleTool, name: 'zebra' });
      registry.register('alpha', { ...sampleTool, name: 'alpha' });
      registry.register('beta', { ...sampleTool, name: 'beta' });

      const docs = registry.generateDocs();

      // Tools should be sorted alphabetically within category
      const alphaIndex = docs.indexOf('### alpha');
      const betaIndex = docs.indexOf('### beta');
      const zebraIndex = docs.indexOf('### zebra');

      expect(alphaIndex).toBeLessThan(betaIndex);
      expect(betaIndex).toBeLessThan(zebraIndex);
    });
  });
});
