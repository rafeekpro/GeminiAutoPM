/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

/**
 * Log levels for filtering
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  name: string;
  level?: LogLevel;
  enableTimestamp?: boolean;
  enableColors?: boolean;
}

/**
 * Simple logger for MCP servers
 * Logs to stderr (stdout is reserved for MCP protocol)
 */
export class Logger {
  private name: string;
  private level: LogLevel;
  private enableTimestamp: boolean;
  private enableColors: boolean;

  constructor(config: LoggerConfig) {
    this.name = config.name;
    this.level = config.level ?? LogLevel.INFO;
    this.enableTimestamp = config.enableTimestamp ?? true;
    this.enableColors = config.enableColors ?? true;
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error): void {
    if (this.level >= LogLevel.ERROR) {
      this.log('ERROR', message, error);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string): void {
    if (this.level >= LogLevel.WARN) {
      this.log('WARN', message);
    }
  }

  /**
   * Log info message
   */
  info(message: string): void {
    if (this.level >= LogLevel.INFO) {
      this.log('INFO', message);
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: unknown): void {
    if (this.level >= LogLevel.DEBUG) {
      this.log('DEBUG', message, data);
    }
  }

  /**
   * Internal log method
   */
  private log(level: string, message: string, data?: unknown): void {
    const timestamp = this.enableTimestamp
      ? new Date().toISOString()
      : '';

    const prefix = this.enableTimestamp
      ? `[${timestamp}] [${this.name}] [${level}]`
      : `[${this.name}] [${level}]`;

    let output = `${prefix} ${message}`;

    if (data) {
      if (data instanceof Error) {
        output += `\n${data.stack || data.message}`;
      } else {
        output += `\n${JSON.stringify(data, null, 2)}`;
      }
    }

    // Use stderr for all logs (stdout is reserved for MCP protocol)
    console.error(this.colorize(level, output));
  }

  /**
   * Colorize output based on level
   */
  private colorize(level: string, text: string): string {
    if (!this.enableColors) {
      return text;
    }

    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[90m', // Gray
    };

    const reset = '\x1b[0m';
    const color = colors[level as keyof typeof colors] || '';

    return `${color}${text}${reset}`;
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }
}
