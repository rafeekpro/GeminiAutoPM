/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import { Logger } from '../utils/logger.js';

/**
 * Cached documentation entry
 */
interface CachedDoc {
  content: string;
  timestamp: number;
}

/**
 * Validation result for Context7 queries
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Context7 client configuration
 */
export interface Context7Config {
  cacheTTL?: number; // Cache time-to-live in milliseconds
  enableCache?: boolean;
  logger?: Logger;
}

/**
 * Client for interacting with Context7 MCP server
 * Provides automatic documentation querying and caching
 */
export class Context7Client {
  private cache: Map<string, CachedDoc> = new Map();
  private readonly cacheTTL: number;
  private readonly enableCache: boolean;
  private readonly logger?: Logger;

  constructor(config: Context7Config = {}) {
    this.cacheTTL = config.cacheTTL ?? 15 * 60 * 1000; // 15 minutes default
    this.enableCache = config.enableCache ?? true;
    this.logger = config.logger;
  }

  /**
   * Query Context7 for documentation
   * @param library - Library name (e.g., 'security', 'agile')
   * @param topic - Topic within library (e.g., 'code-analysis', 'epic-decomposition')
   * @param tokens - Maximum tokens to retrieve (default: 5000)
   * @returns Documentation content
   */
  async query(
    library: string,
    topic: string,
    tokens: number = 5000
  ): Promise<string> {
    const cacheKey = `${library}/${topic}`;

    // Check cache
    if (this.enableCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        this.logger?.debug(`Context7 cache hit: ${cacheKey}`);
        return cached.content;
      }
    }

    // Query Context7 MCP
    this.logger?.debug(`Querying Context7: ${library}/${topic}`);
    const result = await this.queryContext7MCP(library, topic, tokens);

    // Cache result
    if (this.enableCache) {
      this.cache.set(cacheKey, {
        content: result,
        timestamp: Date.now(),
      });
    }

    return result;
  }

  /**
   * Query multiple documentation sources in parallel
   * @param queries - Array of Context7 query URLs
   * @returns Map of query URL to documentation content
   */
  async queryAll(queries: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    // Parse and query all in parallel
    const promises = queries.map(async (query) => {
      try {
        const [library, topic] = this.parseQuery(query);
        const doc = await this.query(library, topic);
        results.set(query, doc);
      } catch (error) {
        this.logger?.error(`Failed to query ${query}`, error as Error);
        results.set(query, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Validate that required queries are present and properly formatted
   * @param toolName - Name of the tool being validated
   * @param queries - Array of Context7 query URLs
   * @returns Validation result
   */
  validateQueries(
    toolName: string,
    queries: string[]
  ): ValidationResult {
    const warnings: string[] = [];

    // Check if queries exist
    if (!queries || queries.length === 0) {
      return {
        valid: false,
        error: `Tool ${toolName} missing Context7 queries. At least one query is required.`,
      };
    }

    // Validate each query format
    for (const query of queries) {
      if (!query.startsWith('mcp://context7/')) {
        return {
          valid: false,
          error: `Invalid Context7 query format: ${query}. Must start with "mcp://context7/"`,
        };
      }

      // Check for proper structure
      const parts = query.replace('mcp://context7/', '').split('/');
      if (parts.length < 2) {
        warnings.push(
          `Query ${query} should have format: mcp://context7/<library>/<topic>`
        );
      }
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Parse Context7 query URL into library and topic
   * @param query - Context7 query URL
   * @returns Tuple of [library, topic]
   */
  private parseQuery(query: string): [string, string] {
    // Format: mcp://context7/<library>/<topic>
    const match = query.match(/^mcp:\/\/context7\/([^/]+)\/(.+)$/);
    if (!match) {
      throw new Error(`Invalid Context7 query format: ${query}`);
    }
    return [match[1], match[2]];
  }

  /**
   * Query Context7 MCP server
   * TODO: This is a placeholder implementation
   * Real implementation would use the Context7 MCP client
   */
  private async queryContext7MCP(
    library: string,
    topic: string,
    tokens: number
  ): Promise<string> {
    // Placeholder implementation
    // In production, this would make actual MCP calls to Context7
    this.logger?.warn(
      `Context7 MCP integration not yet implemented. Using placeholder for ${library}/${topic}`
    );

    return `
# Documentation for ${library}/${topic}

**Note:** This is placeholder documentation. Real Context7 integration will be implemented.

## Overview
Documentation for ${topic} in ${library} domain.

## Best Practices
- Follow industry standards
- Apply latest patterns
- Validate against documentation

## Examples
[Examples would be provided by Context7]

Requested tokens: ${tokens}
`;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger?.debug('Context7 cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
