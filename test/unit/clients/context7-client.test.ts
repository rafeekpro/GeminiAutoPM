/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Context7Client, type ValidationResult } from '../../../src/clients/context7-client.js';
import { Logger, LogLevel } from '../../../src/utils/logger.js';

describe('Context7Client', () => {
  let client: Context7Client;
  let logger: Logger;

  beforeEach(() => {
    // Create logger with disabled output for tests
    logger = new Logger({
      name: 'test',
      level: LogLevel.ERROR,
      enableColors: false,
    });
  });

  describe('Configuration', () => {
    it('should create client with default config', () => {
      client = new Context7Client();
      expect(client).toBeDefined();

      const stats = client.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should create client with custom cache TTL', () => {
      const customTTL = 30 * 60 * 1000; // 30 minutes
      client = new Context7Client({
        cacheTTL: customTTL,
        logger,
      });

      expect(client).toBeDefined();
    });

    it('should create client with cache disabled', () => {
      client = new Context7Client({
        enableCache: false,
        logger,
      });

      expect(client).toBeDefined();
    });

    it('should create client with logger', () => {
      client = new Context7Client({ logger });
      expect(client).toBeDefined();
    });
  });

  describe('Query Method', () => {
    beforeEach(() => {
      client = new Context7Client({
        cacheTTL: 15 * 60 * 1000,
        logger,
      });
    });

    it('should query documentation successfully', async () => {
      const result = await client.query('security', 'code-analysis');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('security');
      expect(result).toContain('code-analysis');
    });

    it('should query with custom token limit', async () => {
      const result = await client.query('agile', 'epic-decomposition', 10000);

      expect(result).toBeDefined();
      expect(result).toContain('10000');
    });

    it('should cache query results', async () => {
      const library = 'testing';
      const topic = 'unit-tests';

      // First query - cache miss
      const result1 = await client.query(library, topic);

      // Second query - should be cache hit
      const result2 = await client.query(library, topic);

      expect(result1).toBe(result2);

      const stats = client.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.keys).toContain(`${library}/${topic}`);
    });

    it('should use cache for repeated queries', async () => {
      const library = 'typescript';
      const topic = 'best-practices';

      await client.query(library, topic);
      await client.query(library, topic);
      await client.query(library, topic);

      const stats = client.getCacheStats();
      expect(stats.size).toBe(1); // Only one cache entry
    });
  });

  describe('Cache Behavior', () => {
    it('should respect cache TTL expiration', async () => {
      // Create client with very short TTL
      client = new Context7Client({
        cacheTTL: 100, // 100ms
        logger,
      });

      const library = 'nodejs';
      const topic = 'async-patterns';

      // First query
      await client.query(library, topic);

      // Wait for cache to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Query again - should be cache miss
      await client.query(library, topic);

      const stats = client.getCacheStats();
      expect(stats.size).toBe(1); // Still one entry, but was re-queried
    });

    it('should not cache when cache is disabled', async () => {
      client = new Context7Client({
        enableCache: false,
        logger,
      });

      await client.query('security', 'authentication');
      await client.query('security', 'authentication');

      const stats = client.getCacheStats();
      expect(stats.size).toBe(0); // No cache entries
    });

    it('should clear cache on demand', async () => {
      client = new Context7Client({ logger });

      await client.query('graphql', 'schema-design');
      await client.query('rest', 'api-design');

      let stats = client.getCacheStats();
      expect(stats.size).toBe(2);

      client.clearCache();

      stats = client.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.keys).toEqual([]);
    });
  });

  describe('QueryAll Method', () => {
    beforeEach(() => {
      client = new Context7Client({ logger });
    });

    it('should query multiple sources in parallel', async () => {
      const queries = [
        'mcp://context7/agile/epic-decomposition',
        'mcp://context7/agile/user-stories',
        'mcp://context7/agile/task-sizing',
      ];

      const results = await client.queryAll(queries);

      expect(results.size).toBe(3);
      expect(results.has(queries[0])).toBe(true);
      expect(results.has(queries[1])).toBe(true);
      expect(results.has(queries[2])).toBe(true);

      // All results should contain documentation
      for (const [query, doc] of results.entries()) {
        expect(doc).toBeDefined();
        expect(typeof doc).toBe('string');
        expect(doc.length).toBeGreaterThan(0);
      }
    });

    it('should handle empty query array', async () => {
      const results = await client.queryAll([]);

      expect(results.size).toBe(0);
    });

    it('should handle invalid queries gracefully', async () => {
      const queries = [
        'mcp://context7/security/ssh-hardening', // Valid
        'invalid-format', // Invalid
        'mcp://context7/testing/jest', // Valid
      ];

      const results = await client.queryAll(queries);

      expect(results.size).toBe(3);
      expect(results.has(queries[0])).toBe(true);
      expect(results.has(queries[1])).toBe(true);
      expect(results.has(queries[2])).toBe(true);

      // Invalid query should have error message
      const invalidResult = results.get(queries[1]);
      expect(invalidResult).toContain('Error');
    });

    it('should cache results from queryAll', async () => {
      const queries = [
        'mcp://context7/docker/best-practices',
        'mcp://context7/kubernetes/deployment',
      ];

      await client.queryAll(queries);

      const stats = client.getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('docker/best-practices');
      expect(stats.keys).toContain('kubernetes/deployment');
    });
  });

  describe('Query Validation', () => {
    beforeEach(() => {
      client = new Context7Client({ logger });
    });

    it('should validate correct query format', () => {
      const queries = [
        'mcp://context7/agile/epic-decomposition',
        'mcp://context7/security/authentication',
      ];

      const result = client.validateQueries('test-tool', queries);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject missing queries', () => {
      const result = client.validateQueries('test-tool', []);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('missing Context7 queries');
    });

    it('should reject undefined queries', () => {
      const result = client.validateQueries('test-tool', undefined as any);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject invalid URL format', () => {
      const queries = [
        'https://wrong-protocol/agile/epics',
      ];

      const result = client.validateQueries('test-tool', queries);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid Context7 query format');
      expect(result.error).toContain('mcp://context7/');
    });

    it('should warn about incomplete query structure', () => {
      const queries = [
        'mcp://context7/agile', // Missing topic
      ];

      const result = client.validateQueries('test-tool', queries);

      expect(result.valid).toBe(true); // Still valid, but with warnings
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);
      expect(result.warnings![0]).toContain('should have format');
    });

    it('should validate mixed valid and warning queries', () => {
      const queries = [
        'mcp://context7/agile/epic-decomposition', // Valid
        'mcp://context7/security', // Warning - missing topic
        'mcp://context7/testing/unit-tests', // Valid
      ];

      const result = client.validateQueries('test-tool', queries);

      expect(result.valid).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBe(1);
    });
  });

  describe('Parse Query', () => {
    beforeEach(() => {
      client = new Context7Client({ logger });
    });

    it('should parse valid query URL', async () => {
      // We test this indirectly through queryAll
      const queries = [
        'mcp://context7/typescript/generics',
      ];

      const results = await client.queryAll(queries);

      expect(results.size).toBe(1);
      const doc = results.get(queries[0]);
      expect(doc).toContain('typescript');
      expect(doc).toContain('generics');
    });

    it('should handle query with multiple path segments', async () => {
      const queries = [
        'mcp://context7/azure-devops/pipelines/yaml',
      ];

      const results = await client.queryAll(queries);

      expect(results.size).toBe(1);
      const doc = results.get(queries[0]);
      expect(doc).toBeDefined();
    });

    it('should fail on malformed query', async () => {
      const queries = [
        'not-a-valid-url',
      ];

      const results = await client.queryAll(queries);

      expect(results.size).toBe(1);
      const error = results.get(queries[0]);
      expect(error).toContain('Error');
      expect(error).toContain('Invalid Context7 query format');
    });
  });

  describe('Cache Statistics', () => {
    beforeEach(() => {
      client = new Context7Client({ logger });
    });

    it('should return empty stats for new client', () => {
      const stats = client.getCacheStats();

      expect(stats.size).toBe(0);
      expect(stats.keys).toEqual([]);
    });

    it('should track cache entries', async () => {
      await client.query('python', 'async-await');
      await client.query('rust', 'ownership');
      await client.query('go', 'goroutines');

      const stats = client.getCacheStats();

      expect(stats.size).toBe(3);
      expect(stats.keys).toContain('python/async-await');
      expect(stats.keys).toContain('rust/ownership');
      expect(stats.keys).toContain('go/goroutines');
    });

    it('should update stats after cache clear', async () => {
      await client.query('javascript', 'promises');
      await client.query('javascript', 'async-await');

      let stats = client.getCacheStats();
      expect(stats.size).toBe(2);

      client.clearCache();

      stats = client.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.keys).toEqual([]);
    });
  });

  describe('Logger Integration', () => {
    it('should work without logger', async () => {
      client = new Context7Client(); // No logger

      const result = await client.query('testing', 'integration-tests');

      expect(result).toBeDefined();
    });

    it('should log cache hits when logger present', async () => {
      const loggerWithDebug = new Logger({
        name: 'test',
        level: LogLevel.DEBUG,
        enableColors: false,
      });

      const debugSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      client = new Context7Client({ logger: loggerWithDebug });

      await client.query('mcp', 'best-practices');
      await client.query('mcp', 'best-practices'); // Cache hit

      // Should have debug logs
      expect(debugSpy).toHaveBeenCalled();

      debugSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      client = new Context7Client({ logger });
    });

    it('should handle special characters in library/topic', async () => {
      const result = await client.query('node-js', 'event-loop');

      expect(result).toBeDefined();
      expect(result).toContain('node-js');
      expect(result).toContain('event-loop');
    });

    it('should handle very large token requests', async () => {
      const result = await client.query('architecture', 'microservices', 50000);

      expect(result).toBeDefined();
      expect(result).toContain('50000');
    });

    it('should handle rapid sequential queries', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(client.query('performance', 'optimization'));
      }

      const results = await Promise.all(promises);

      expect(results.length).toBe(10);
      // All should be the same due to caching
      const first = results[0];
      results.forEach((r) => expect(r).toBe(first));

      const stats = client.getCacheStats();
      expect(stats.size).toBe(1); // Only one cache entry
    });
  });
});
