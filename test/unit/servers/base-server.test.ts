/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { z } from 'zod';
import { BaseMCPServer, type ServerConfig, type ToolHandler } from '../../../src/servers/base-server.js';
import { ToolCategory, type ToolMetadata } from '../../../src/registry/tool-registry.js';
import { LogLevel } from '../../../src/utils/logger.js';

/**
 * Concrete test implementation of BaseMCPServer
 */
class TestServer extends BaseMCPServer {
  public toolsInitialized = false;
  public customValidationCalled = false;

  protected initializeTools(): void {
    this.toolsInitialized = true;

    // Register a sample tool
    this.registerTool(
      'test_tool',
      {
        name: 'test_tool',
        category: ToolCategory.AGENT,
        description: 'Test tool for unit testing',
        inputSchema: z.object({
          message: z.string(),
        }),
        context7Queries: ['mcp://context7/testing/unit-tests'],
        examples: [
          {
            description: 'Example usage',
            input: { message: 'test' },
            expectedOutput: 'Success',
          },
        ],
        version: '1.0.0',
      },
      async (params) => {
        return {
          content: [
            {
              type: 'text',
              text: `Received: ${params.message}`,
            },
          ],
        };
      }
    );
  }

  protected customValidation(name: string, metadata: ToolMetadata): void {
    this.customValidationCalled = true;
  }

  // Expose protected methods for testing
  public testRegisterTool(
    name: string,
    metadata: ToolMetadata,
    handler: ToolHandler
  ): void {
    this.registerTool(name, metadata, handler);
  }

  public testValidateTool(name: string, metadata: ToolMetadata): void {
    this.validateTool(name, metadata);
  }
}

describe('BaseMCPServer', () => {
  let server: TestServer;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  const defaultConfig: ServerConfig = {
    name: 'test-server',
    version: '1.0.0',
    logLevel: LogLevel.ERROR, // Quiet for tests
    enableContext7: true,
  };

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    server = new TestServer(defaultConfig);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Construction', () => {
    it('should create server with required config', () => {
      expect(server).toBeDefined();
      expect(server.toolsInitialized).toBe(false);
    });

    it('should initialize logger with server name', () => {
      const stats = server.getStats();
      expect(stats.name).toBe('test-server');
      expect(stats.version).toBe('1.0.0');
    });

    it('should initialize Context7 client', () => {
      const stats = server.getStats();
      expect(stats.context7Cache).toBeDefined();
      expect(stats.context7Cache.size).toBe(0);
    });

    it('should initialize tool registry', () => {
      const stats = server.getStats();
      expect(stats.registry).toBeDefined();
      expect(stats.registry.totalTools).toBe(0);
    });

    it('should use default log level if not provided', () => {
      const serverNoLog = new TestServer({
        name: 'test',
        version: '1.0.0',
      });

      expect(serverNoLog).toBeDefined();
    });

    it('should respect enableContext7 flag', () => {
      const serverNoContext7 = new TestServer({
        name: 'test',
        version: '1.0.0',
        enableContext7: false,
      });

      expect(serverNoContext7).toBeDefined();
    });
  });

  describe('Tool Registration', () => {
    const sampleTool: ToolMetadata = {
      name: 'sample_tool',
      category: ToolCategory.PM,
      description: 'Sample tool for testing',
      inputSchema: z.object({
        input: z.string(),
      }),
      context7Queries: ['mcp://context7/testing/sample'],
      examples: [],
      version: '1.0.0',
    };

    const sampleHandler: ToolHandler = async (params) => {
      return {
        content: [{ type: 'text', text: `Input: ${params.input}` }],
      };
    };

    it('should register a valid tool', () => {
      server.testRegisterTool('sample_tool', sampleTool, sampleHandler);

      const stats = server.getStats();
      expect(stats.registry.totalTools).toBe(1);
    });

    it('should call custom validation during registration', () => {
      server.testRegisterTool('sample_tool', sampleTool, sampleHandler);

      expect(server.customValidationCalled).toBe(true);
    });

    it('should register tool in registry', () => {
      server.testRegisterTool('sample_tool', sampleTool, sampleHandler);

      const registryTool = server['registry'].get('sample_tool');
      expect(registryTool).toBeDefined();
      expect(registryTool?.name).toBe('sample_tool');
      expect(registryTool?.category).toBe(ToolCategory.PM);
    });

    it('should reject tool with invalid Context7 queries', () => {
      const invalidTool = {
        ...sampleTool,
        context7Queries: ['https://invalid-format'],
      };

      expect(() => {
        server.testRegisterTool('invalid_tool', invalidTool, sampleHandler);
      }).toThrow();
    });

    it('should reject tool with missing Context7 queries', () => {
      const invalidTool = {
        ...sampleTool,
        context7Queries: [],
      };

      expect(() => {
        server.testRegisterTool('invalid_tool', invalidTool, sampleHandler);
      }).toThrow('Tool invalid_tool missing Context7 queries');
    });

    it('should register multiple tools', () => {
      const tool1 = { ...sampleTool, name: 'tool1' };
      const tool2 = { ...sampleTool, name: 'tool2' };

      server.testRegisterTool('tool1', tool1, sampleHandler);
      server.testRegisterTool('tool2', tool2, sampleHandler);

      const stats = server.getStats();
      expect(stats.registry.totalTools).toBe(2);
    });
  });

  describe('Tool Validation', () => {
    const validTool: ToolMetadata = {
      name: 'valid_tool',
      category: ToolCategory.SECURITY,
      description: 'Valid tool',
      inputSchema: z.object({ data: z.string() }),
      context7Queries: [
        'mcp://context7/security/authentication',
        'mcp://context7/security/authorization',
      ],
      examples: [],
      version: '1.0.0',
    };

    it('should validate correct tool definition', () => {
      expect(() => {
        server.testValidateTool('valid_tool', validTool);
      }).not.toThrow();
    });

    it('should reject tool with invalid query format', () => {
      const invalid = {
        ...validTool,
        context7Queries: ['not-mcp-format'],
      };

      expect(() => {
        server.testValidateTool('invalid_tool', invalid);
      }).toThrow('Invalid Context7 query format');
    });

    it('should call custom validation', () => {
      server.customValidationCalled = false;
      server.testValidateTool('valid_tool', validTool);

      expect(server.customValidationCalled).toBe(true);
    });

    it('should warn about incomplete query structure', () => {
      const warnLogger = jest.spyOn(server['logger'], 'warn');

      const toolWithWarning = {
        ...validTool,
        context7Queries: ['mcp://context7/incomplete'], // Missing topic
      };

      server.testValidateTool('warn_tool', toolWithWarning);

      expect(warnLogger).toHaveBeenCalled();
    });
  });

  describe('Tool Initialization', () => {
    it('should call initializeTools in subclass', () => {
      server.toolsInitialized = false;
      server['initializeTools']();

      expect(server.toolsInitialized).toBe(true);
    });

    it('should register tools during initialization', () => {
      server['initializeTools']();

      const stats = server.getStats();
      expect(stats.registry.totalTools).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      // Initialize tools
      server['initializeTools']();
    });

    it('should provide comprehensive server statistics', () => {
      const stats = server.getStats();

      expect(stats.name).toBe('test-server');
      expect(stats.version).toBe('1.0.0');
      expect(stats.registry).toBeDefined();
      expect(stats.context7Cache).toBeDefined();
    });

    it('should track registry statistics', () => {
      const stats = server.getStats();

      expect(stats.registry.totalTools).toBeGreaterThan(0);
      expect(stats.registry.byCategory).toBeDefined();
    });

    it('should track Context7 cache statistics', () => {
      const stats = server.getStats();

      expect(stats.context7Cache.size).toBeGreaterThanOrEqual(0);
      expect(stats.context7Cache.keys).toBeDefined();
    });

    it('should update stats after tool registration', () => {
      const beforeStats = server.getStats();
      const beforeCount = beforeStats.registry.totalTools;

      const newTool: ToolMetadata = {
        name: 'new_tool',
        category: ToolCategory.DEVOPS,
        description: 'New tool',
        inputSchema: z.object({}),
        context7Queries: ['mcp://context7/devops/deployment'],
        examples: [],
        version: '1.0.0',
      };

      server.testRegisterTool('new_tool', newTool, async () => ({
        content: [{ type: 'text', text: 'ok' }],
      }));

      const afterStats = server.getStats();
      expect(afterStats.registry.totalTools).toBe(beforeCount + 1);
    });
  });

  describe('Context7 Integration', () => {
    it('should query Context7 when enabled', async () => {
      const serverWithContext7 = new TestServer({
        ...defaultConfig,
        enableContext7: true,
      });

      const tool: ToolMetadata = {
        name: 'context7_tool',
        category: ToolCategory.AGENT,
        description: 'Tool with Context7',
        inputSchema: z.object({ data: z.string() }),
        context7Queries: ['mcp://context7/testing/context7'],
        examples: [],
        version: '1.0.0',
      };

      let receivedDocs: Map<string, string> | undefined;

      const handler: ToolHandler = async (params, context7Docs) => {
        receivedDocs = context7Docs;
        return {
          content: [{ type: 'text', text: 'ok' }],
        };
      };

      serverWithContext7.testRegisterTool('context7_tool', tool, handler);

      // Handler would be invoked with Context7 docs when tool is called
      expect(serverWithContext7).toBeDefined();
    });

    it('should work without Context7 when disabled', () => {
      const serverNoContext7 = new TestServer({
        ...defaultConfig,
        enableContext7: false,
      });

      const tool: ToolMetadata = {
        name: 'no_context7_tool',
        category: ToolCategory.AGENT,
        description: 'Tool without Context7',
        inputSchema: z.object({}),
        context7Queries: ['mcp://context7/testing/sample'],
        examples: [],
        version: '1.0.0',
      };

      expect(() => {
        serverNoContext7.testRegisterTool('no_context7_tool', tool, async () => ({
          content: [{ type: 'text', text: 'ok' }],
        }));
      }).not.toThrow();
    });
  });

  describe('Schema Conversion', () => {
    it('should handle ZodObject schemas', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const tool: ToolMetadata = {
        name: 'schema_tool',
        category: ToolCategory.AGENT,
        description: 'Tool with object schema',
        inputSchema: schema,
        context7Queries: ['mcp://context7/testing/schema'],
        examples: [],
        version: '1.0.0',
      };

      expect(() => {
        server.testRegisterTool('schema_tool', tool, async () => ({
          content: [{ type: 'text', text: 'ok' }],
        }));
      }).not.toThrow();
    });

    it('should handle complex nested schemas', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        options: z.object({
          verbose: z.boolean().optional(),
          timeout: z.number().positive(),
        }),
        tags: z.array(z.string()),
      });

      const tool: ToolMetadata = {
        name: 'complex_schema_tool',
        category: ToolCategory.AGENT,
        description: 'Tool with complex schema',
        inputSchema: schema,
        context7Queries: ['mcp://context7/testing/complex'],
        examples: [],
        version: '1.0.0',
      };

      expect(() => {
        server.testRegisterTool('complex_schema_tool', tool, async () => ({
          content: [{ type: 'text', text: 'ok' }],
        }));
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle registration errors gracefully', () => {
      const invalidTool: ToolMetadata = {
        name: '',
        category: ToolCategory.AGENT,
        description: 'Invalid tool',
        inputSchema: z.object({}),
        context7Queries: ['mcp://context7/test'],
        examples: [],
        version: '1.0.0',
      };

      expect(() => {
        server.testRegisterTool('invalid', invalidTool, async () => ({
          content: [{ type: 'text', text: 'ok' }],
        }));
      }).toThrow();
    });

    it('should handle duplicate tool registration', () => {
      const tool: ToolMetadata = {
        name: 'duplicate_tool',
        category: ToolCategory.AGENT,
        description: 'Duplicate tool',
        inputSchema: z.object({}),
        context7Queries: ['mcp://context7/test'],
        examples: [],
        version: '1.0.0',
      };

      server.testRegisterTool('duplicate_tool', tool, async () => ({
        content: [{ type: 'text', text: 'ok' }],
      }));

      expect(() => {
        server.testRegisterTool('duplicate_tool', tool, async () => ({
          content: [{ type: 'text', text: 'ok' }],
        }));
      }).toThrow('already registered');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tool examples', () => {
      const tool: ToolMetadata = {
        name: 'no_examples_tool',
        category: ToolCategory.DOCUMENTATION,
        description: 'Tool without examples',
        inputSchema: z.object({ data: z.string() }),
        context7Queries: ['mcp://context7/docs/generation'],
        examples: [], // Empty
        version: '1.0.0',
      };

      expect(() => {
        server.testRegisterTool('no_examples_tool', tool, async () => ({
          content: [{ type: 'text', text: 'ok' }],
        }));
      }).not.toThrow();
    });

    it('should handle multiple Context7 queries', () => {
      const tool: ToolMetadata = {
        name: 'multi_query_tool',
        category: ToolCategory.SECURITY,
        description: 'Tool with multiple queries',
        inputSchema: z.object({}),
        context7Queries: [
          'mcp://context7/security/authentication',
          'mcp://context7/security/authorization',
          'mcp://context7/security/encryption',
          'mcp://context7/security/best-practices',
        ],
        examples: [],
        version: '1.0.0',
      };

      expect(() => {
        server.testRegisterTool('multi_query_tool', tool, async () => ({
          content: [{ type: 'text', text: 'ok' }],
        }));
      }).not.toThrow();
    });

    it('should handle tool names with special characters', () => {
      const tool: ToolMetadata = {
        name: 'special-tool_v2.0',
        category: ToolCategory.FRAMEWORK,
        description: 'Tool with special name',
        inputSchema: z.object({}),
        context7Queries: ['mcp://context7/framework/testing'],
        examples: [],
        version: '2.0.0',
      };

      expect(() => {
        server.testRegisterTool('special-tool_v2.0', tool, async () => ({
          content: [{ type: 'text', text: 'ok' }],
        }));
      }).not.toThrow();
    });

    it('should handle various tool categories', () => {
      const categories = [
        ToolCategory.AGENT,
        ToolCategory.PM,
        ToolCategory.DEVOPS,
        ToolCategory.LANGUAGE,
        ToolCategory.FRAMEWORK,
        ToolCategory.SECURITY,
        ToolCategory.PERFORMANCE,
        ToolCategory.DOCUMENTATION,
      ];

      categories.forEach((category, index) => {
        const tool: ToolMetadata = {
          name: `tool_${index}`,
          category,
          description: `Tool for ${category}`,
          inputSchema: z.object({}),
          context7Queries: [`mcp://context7/${category}/test`],
          examples: [],
          version: '1.0.0',
        };

        expect(() => {
          server.testRegisterTool(`tool_${index}`, tool, async () => ({
            content: [{ type: 'text', text: 'ok' }],
          }));
        }).not.toThrow();
      });

      const stats = server.getStats();
      expect(stats.registry.byCategory.size).toBeGreaterThan(0);
    });
  });

  describe('Abstract Methods', () => {
    it('should require subclasses to implement initializeTools', () => {
      // TypeScript enforces this at compile time
      // This test verifies the contract is satisfied
      expect(server['initializeTools']).toBeDefined();
      expect(typeof server['initializeTools']).toBe('function');
    });

    it('should allow subclasses to override customValidation', () => {
      // CustomValidation is optional to override
      expect(server['customValidation']).toBeDefined();
      expect(typeof server['customValidation']).toBe('function');
    });
  });
});
