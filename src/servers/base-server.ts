/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { Logger, LogLevel } from '../utils/logger.js';
import { Context7Client } from '../clients/context7-client.js';
import { ToolRegistry, ToolCategory, type ToolMetadata } from '../registry/tool-registry.js';

/**
 * Server configuration
 */
export interface ServerConfig {
  name: string;
  version: string;
  logLevel?: LogLevel;
  enableContext7?: boolean;
}

/**
 * Tool handler function signature
 */
export type ToolHandler = (params: any, context7Docs?: Map<string, string>) => Promise<{
  content: Array<{
    type: string;
    text: string;
  }>;
  structuredContent?: unknown;
  isError?: boolean;
}>;

/**
 * Abstract base class for all MCP servers
 * Provides common functionality: logging, Context7 integration, tool registry
 *
 * Following best practices from Context7:
 * - MCP TypeScript SDK patterns
 * - Abstract class design from TypeScript
 * - Domain-Driven Design architecture
 */
export abstract class BaseMCPServer {
  protected readonly server: McpServer;
  protected readonly logger: Logger;
  protected readonly context7: Context7Client;
  protected readonly registry: ToolRegistry;
  protected readonly config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;

    // Initialize logger
    this.logger = new Logger({
      name: config.name,
      level: config.logLevel ?? LogLevel.INFO,
    });

    // Initialize Context7 client
    this.context7 = new Context7Client({
      enableCache: true,
      cacheTTL: 15 * 60 * 1000, // 15 minutes
      logger: this.logger,
    });

    // Initialize tool registry
    this.registry = new ToolRegistry(this.logger);

    // Create MCP server
    this.server = new McpServer({
      name: config.name,
      version: config.version,
    });

    this.logger.info(`Initializing ${config.name} v${config.version}`);
  }

  /**
   * Register a tool with automatic Context7 integration
   * @param name - Tool name
   * @param metadata - Tool metadata including Context7 queries
   * @param handler - Tool execution handler
   */
  protected registerTool(
    name: string,
    metadata: ToolMetadata,
    handler: ToolHandler
  ): void {
    try {
      // 1. Validate tool definition
      this.validateTool(name, metadata);

      // 2. Register in registry
      this.registry.register(name, metadata);

      // 3. Wrap handler with Context7 queries if enabled
      const wrappedHandler = this.config.enableContext7 !== false
        ? this.wrapWithContext7(handler, metadata.context7Queries)
        : handler;

      // 4. Register with MCP server
      this.server.registerTool(
        name,
        {
          title: metadata.description,
          description: metadata.description,
          inputSchema: this.zodToShape(metadata.inputSchema),
        },
        wrappedHandler as any
      );

      this.logger.info(`Registered tool: ${name} [${metadata.category}]`);
    } catch (error) {
      this.logger.error(`Failed to register tool ${name}`, error as Error);
      throw error;
    }
  }

  /**
   * Wrap handler with automatic Context7 documentation queries
   * @param handler - Original tool handler
   * @param queries - Context7 query URLs
   * @returns Wrapped handler with Context7 docs injected
   */
  private wrapWithContext7(
    handler: ToolHandler,
    queries: string[]
  ): ToolHandler {
    return async (params) => {
      let context7Docs: Map<string, string> | undefined;

      try {
        // Query Context7 for documentation
        if (queries.length > 0) {
          this.logger.debug(`Querying Context7: ${queries.length} queries`);
          context7Docs = await this.context7.queryAll(queries);
        }
      } catch (error) {
        this.logger.warn(`Context7 query failed, continuing without docs: ${(error as Error).message}`);
        // Continue execution even if Context7 fails
      }

      // Execute handler with Context7 docs
      return handler(params, context7Docs);
    };
  }

  /**
   * Convert Zod schema to MCP input schema shape
   * @param schema - Zod schema
   * @returns MCP-compatible schema shape
   */
  private zodToShape(schema: z.ZodSchema): any {
    // If schema is a ZodObject, return its shape
    if (schema instanceof z.ZodObject) {
      return schema.shape;
    }
    // Otherwise, wrap in an object
    return { value: schema };
  }

  /**
   * Validate tool definition
   * @param name - Tool name
   * @param metadata - Tool metadata
   */
  protected validateTool(name: string, metadata: ToolMetadata): void {
    // Validate Context7 queries
    const validation = this.context7.validateQueries(name, metadata.context7Queries);

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (validation.warnings && validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        this.logger.warn(`Tool ${name}: ${warning}`);
      });
    }

    // Allow subclasses to add custom validation
    this.customValidation(name, metadata);
  }

  /**
   * Custom validation hook for subclasses
   * Override this to add server-specific validation
   */
  protected customValidation(name: string, metadata: ToolMetadata): void {
    // Default: no additional validation
    // Subclasses can override
  }

  /**
   * Start the MCP server
   * Connects to stdio transport and begins listening
   */
  async start(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      const stats = this.registry.getStats();
      this.logger.info(
        `${this.config.name} started successfully - ${stats.totalTools} tools registered`
      );

      // Log tools by category
      for (const [category, count] of stats.byCategory.entries()) {
        this.logger.debug(`  ${category}: ${count} tools`);
      }
    } catch (error) {
      this.logger.error('Failed to start server', error as Error);
      throw error;
    }
  }

  /**
   * Get server statistics
   */
  getStats() {
    return {
      name: this.config.name,
      version: this.config.version,
      registry: this.registry.getStats(),
      context7Cache: this.context7.getCacheStats(),
    };
  }

  /**
   * Abstract method: Initialize tools
   * Must be implemented by subclasses to register their specific tools
   */
  protected abstract initializeTools(): void;
}
