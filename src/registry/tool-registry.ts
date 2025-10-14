/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import { z } from 'zod';
import type { Logger } from '../utils/logger.js';

/**
 * Tool category classification
 */
export enum ToolCategory {
  AGENT = 'agent',
  PM = 'project-management',
  DEVOPS = 'devops',
  LANGUAGE = 'language',
  FRAMEWORK = 'framework',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  DOCUMENTATION = 'documentation',
}

/**
 * Tool usage example
 */
export interface ToolExample {
  description: string;
  input: Record<string, unknown>;
  expectedOutput: string;
}

/**
 * Tool metadata
 */
export interface ToolMetadata {
  name: string;
  category: ToolCategory;
  description: string;
  inputSchema: z.ZodSchema;
  context7Queries: string[];
  examples: ToolExample[];
  version: string;
  deprecated?: boolean;
  replacedBy?: string;
}

/**
 * Registry statistics
 */
export interface RegistryStats {
  totalTools: number;
  byCategory: Map<ToolCategory, number>;
  deprecated: number;
}

/**
 * Central registry for all MCP tools
 * Maintains metadata and enables validation, documentation generation
 */
export class ToolRegistry {
  private tools: Map<string, ToolMetadata> = new Map();
  private logger?: Logger;

  constructor(logger?: Logger) {
    this.logger = logger;
  }

  /**
   * Register a tool with metadata
   */
  register(name: string, metadata: ToolMetadata): void {
    if (this.tools.has(name)) {
      throw new Error(`Tool ${name} already registered`);
    }

    // Validate metadata
    this.validateMetadata(metadata);

    // Store
    this.tools.set(name, metadata);
    this.logger?.info(`Registered tool: ${name} [${metadata.category}]`);
  }

  /**
   * Get tool metadata
   */
  get(name: string): ToolMetadata | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all tools
   */
  getAll(): ToolMetadata[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getByCategory(category: ToolCategory): ToolMetadata[] {
    return Array.from(this.tools.values())
      .filter(tool => tool.category === category && !tool.deprecated);
  }

  /**
   * Check if tool exists
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Update tool metadata
   */
  update(name: string, metadata: Partial<ToolMetadata>): void {
    const existing = this.tools.get(name);
    if (!existing) {
      throw new Error(`Tool ${name} not found`);
    }

    const updated = { ...existing, ...metadata };
    this.validateMetadata(updated);

    this.tools.set(name, updated);
    this.logger?.info(`Updated tool: ${name}`);
  }

  /**
   * Mark tool as deprecated
   */
  deprecate(name: string, replacedBy?: string): void {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    tool.deprecated = true;
    if (replacedBy) {
      tool.replacedBy = replacedBy;
    }

    this.logger?.warn(`Tool ${name} marked as deprecated${replacedBy ? `, use ${replacedBy} instead` : ''}`);
  }

  /**
   * Remove tool from registry
   */
  remove(name: string): void {
    if (!this.tools.has(name)) {
      throw new Error(`Tool ${name} not found`);
    }

    this.tools.delete(name);
    this.logger?.info(`Removed tool: ${name}`);
  }

  /**
   * Get registry statistics
   */
  getStats(): RegistryStats {
    const byCategory = new Map<ToolCategory, number>();
    let deprecated = 0;

    for (const tool of this.tools.values()) {
      const count = byCategory.get(tool.category) || 0;
      byCategory.set(tool.category, count + 1);

      if (tool.deprecated) {
        deprecated++;
      }
    }

    return {
      totalTools: this.tools.size,
      byCategory,
      deprecated,
    };
  }

  /**
   * Generate documentation for all tools
   */
  generateDocs(): string {
    let docs = '# Available Tools\n\n';

    const categories = this.groupByCategory();

    for (const [category, tools] of categories) {
      docs += `## ${category}\n\n`;

      for (const tool of tools) {
        docs += `### ${tool.name}\n`;
        if (tool.deprecated) {
          docs += `**⚠️ DEPRECATED**`;
          if (tool.replacedBy) {
            docs += `: Use \`${tool.replacedBy}\` instead`;
          }
          docs += '\n\n';
        }

        docs += `${tool.description}\n\n`;

        docs += `**Version:** ${tool.version}\n\n`;

        docs += `**Context7 Documentation Queries:**\n`;
        tool.context7Queries.forEach(query => {
          docs += `- \`${query}\`\n`;
        });
        docs += '\n';

        if (tool.examples.length > 0) {
          docs += `**Examples:**\n\n`;
          tool.examples.forEach((example, index) => {
            docs += `${index + 1}. ${example.description}\n`;
            docs += `   \`\`\`json\n`;
            docs += `   ${JSON.stringify(example.input, null, 2)}\n`;
            docs += `   \`\`\`\n`;
            docs += `   Expected: ${example.expectedOutput}\n\n`;
          });
        }

        docs += '---\n\n';
      }
    }

    return docs;
  }

  /**
   * Validate tool metadata
   */
  private validateMetadata(metadata: ToolMetadata): void {
    if (!metadata.name || metadata.name.trim().length === 0) {
      throw new Error('Tool name is required');
    }

    if (!metadata.description || metadata.description.trim().length === 0) {
      throw new Error('Tool description is required');
    }

    if (!metadata.inputSchema) {
      throw new Error('Tool input schema is required');
    }

    if (!metadata.context7Queries || metadata.context7Queries.length === 0) {
      throw new Error('At least one Context7 query is required');
    }

    // Validate Context7 query format
    for (const query of metadata.context7Queries) {
      if (!query.startsWith('mcp://context7/')) {
        throw new Error(`Invalid Context7 query format: ${query}`);
      }
    }

    if (!metadata.version) {
      throw new Error('Tool version is required');
    }

    if (!metadata.category) {
      throw new Error('Tool category is required');
    }
  }

  /**
   * Group tools by category
   */
  private groupByCategory(): Map<ToolCategory, ToolMetadata[]> {
    const grouped = new Map<ToolCategory, ToolMetadata[]>();

    for (const tool of this.tools.values()) {
      if (!grouped.has(tool.category)) {
        grouped.set(tool.category, []);
      }
      grouped.get(tool.category)!.push(tool);
    }

    // Sort tools within each category by name
    for (const tools of grouped.values()) {
      tools.sort((a, b) => a.name.localeCompare(b.name));
    }

    return grouped;
  }

  /**
   * Clear all tools (useful for testing)
   */
  clear(): void {
    this.tools.clear();
    this.logger?.info('Registry cleared');
  }
}
