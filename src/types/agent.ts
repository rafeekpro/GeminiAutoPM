/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

/**
 * Agent configuration and metadata
 */
export interface AgentConfig {
  name: string;
  description: string;
  capabilities: string[];
  context: string;
  documentation?: {
    queries: string[];
    why: string;
  };
}

/**
 * Agent execution result
 */
export interface AgentResult {
  success: boolean;
  content: string;
  metadata?: {
    agent: string;
    timestamp: string;
    duration?: number;
  };
  error?: string;
}

/**
 * Agent tool parameters
 */
export interface AgentToolParams {
  task: string;
  scope?: string;
  options?: Record<string, unknown>;
}
