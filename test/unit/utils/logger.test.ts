/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Logger, LogLevel } from '../../../src/utils/logger.js';

describe('Logger', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    // Spy on console.error (logger uses stderr)
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  describe('Configuration', () => {
    it('should create logger with required config', () => {
      const logger = new Logger({ name: 'test-logger' });
      expect(logger).toBeDefined();
      expect(logger.getLevel()).toBe(LogLevel.INFO); // default
    });

    it('should respect custom log level', () => {
      const logger = new Logger({
        name: 'test-logger',
        level: LogLevel.DEBUG,
      });
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);
    });

    it('should allow changing log level', () => {
      const logger = new Logger({ name: 'test-logger' });
      logger.setLevel(LogLevel.ERROR);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });
  });

  describe('Error Logging', () => {
    it('should log error messages', () => {
      const logger = new Logger({ name: 'test' });
      logger.error('test error');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).toContain('[test]');
      expect(output).toContain('[ERROR]');
      expect(output).toContain('test error');
    });

    it('should log error with Error object', () => {
      const logger = new Logger({ name: 'test' });
      const error = new Error('test error');
      logger.error('Error occurred', error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).toContain('Error occurred');
      expect(output).toContain('test error');
    });

    it('should always log errors regardless of level', () => {
      const logger = new Logger({
        name: 'test',
        level: LogLevel.ERROR,
      });

      logger.error('error message');
      logger.warn('warn message');
      logger.info('info message');
      logger.debug('debug message');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // Only error
    });
  });

  describe('Warning Logging', () => {
    it('should log warnings at WARN level', () => {
      const logger = new Logger({
        name: 'test',
        level: LogLevel.WARN,
      });

      logger.warn('warning message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).toContain('[WARN]');
      expect(output).toContain('warning message');
    });

    it('should not log warnings below WARN level', () => {
      const logger = new Logger({
        name: 'test',
        level: LogLevel.ERROR,
      });

      logger.warn('warning message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Info Logging', () => {
    it('should log info at INFO level', () => {
      const logger = new Logger({
        name: 'test',
        level: LogLevel.INFO,
      });

      logger.info('info message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).toContain('[INFO]');
      expect(output).toContain('info message');
    });

    it('should not log info below INFO level', () => {
      const logger = new Logger({
        name: 'test',
        level: LogLevel.WARN,
      });

      logger.info('info message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Debug Logging', () => {
    it('should log debug at DEBUG level', () => {
      const logger = new Logger({
        name: 'test',
        level: LogLevel.DEBUG,
      });

      logger.debug('debug message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).toContain('[DEBUG]');
      expect(output).toContain('debug message');
    });

    it('should log debug with data object', () => {
      const logger = new Logger({
        name: 'test',
        level: LogLevel.DEBUG,
      });

      const data = { key: 'value', count: 42 };
      logger.debug('debug message', data);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).toContain('debug message');
      expect(output).toContain('"key"');
      expect(output).toContain('"value"');
    });

    it('should not log debug below DEBUG level', () => {
      const logger = new Logger({
        name: 'test',
        level: LogLevel.INFO,
      });

      logger.debug('debug message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Timestamp', () => {
    it('should include timestamp by default', () => {
      const logger = new Logger({ name: 'test' });
      logger.info('test message');

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      // Check for ISO timestamp pattern: YYYY-MM-DDTHH:MM:SS
      expect(output).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should omit timestamp when disabled', () => {
      const logger = new Logger({
        name: 'test',
        enableTimestamp: false,
      });
      logger.info('test message');

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
      expect(output).toContain('[test]');
      expect(output).toContain('[INFO]');
    });
  });

  describe('Colors', () => {
    it('should include color codes by default', () => {
      const logger = new Logger({ name: 'test' });
      logger.error('test message');

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      // Check for ANSI color codes
      expect(output).toMatch(/\x1b\[\d+m/);
    });

    it('should omit colors when disabled', () => {
      const logger = new Logger({
        name: 'test',
        enableColors: false,
      });
      logger.error('test message');

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).not.toMatch(/\x1b\[\d+m/);
    });
  });

  describe('Log Level Filtering', () => {
    it('should respect ERROR level', () => {
      const logger = new Logger({
        name: 'test',
        level: LogLevel.ERROR,
      });

      logger.error('error');
      logger.warn('warn');
      logger.info('info');
      logger.debug('debug');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should respect WARN level', () => {
      const logger = new Logger({
        name: 'test',
        level: LogLevel.WARN,
      });

      logger.error('error');
      logger.warn('warn');
      logger.info('info');
      logger.debug('debug');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2); // error + warn
    });

    it('should respect INFO level', () => {
      const logger = new Logger({
        name: 'test',
        level: LogLevel.INFO,
      });

      logger.error('error');
      logger.warn('warn');
      logger.info('info');
      logger.debug('debug');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(3); // error + warn + info
    });

    it('should respect DEBUG level', () => {
      const logger = new Logger({
        name: 'test',
        level: LogLevel.DEBUG,
      });

      logger.error('error');
      logger.warn('warn');
      logger.info('info');
      logger.debug('debug');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(4); // all
    });
  });
});
