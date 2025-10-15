/**
 * @license
 * Copyright 2025 Rafeek Pro
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * File Operations Utility
 *
 * Provides robust file system operations for PM workflow:
 * - Creating .claude/ directory structure
 * - Reading/writing PRD and Epic files
 * - Managing task files within epic directories
 *
 * Uses fs-extra for:
 * - Automatic parent directory creation
 * - Promise-based async operations
 * - Graceful error handling
 *
 * Context7 Best Practices Applied:
 * - ensureDir() for creating directories with parents
 * - outputFile() for creating files with parent dirs
 * - pathExists() for safe existence checks
 * - readFile/writeFile with proper error handling
 */

/**
 * Get the .claude directory path
 * CRITICAL: Always uses .claude/ path (never autopm/)
 *
 * Working Directory Priority:
 * 1. Explicit workingDir parameter
 * 2. GEMINI_WORKSPACE environment variable
 * 3. AUTOPM_WORKSPACE environment variable
 * 4. process.cwd() (fallback)
 */
export function getClaudeDir(workingDir?: string): string {
  const effectiveWorkingDir = workingDir
    || process.env.GEMINI_WORKSPACE
    || process.env.AUTOPM_WORKSPACE
    || process.cwd();
  return path.join(effectiveWorkingDir, '.claude');
}

/**
 * Get the .claude/epics directory path
 */
export function getEpicsDir(workingDir?: string): string {
  return path.join(getClaudeDir(workingDir), 'epics');
}

/**
 * Get the .claude/prds directory path
 */
export function getPrdsDir(workingDir?: string): string {
  return path.join(getClaudeDir(workingDir), 'prds');
}

/**
 * Get specific epic directory path
 */
export function getEpicDir(epicName: string, workingDir?: string): string {
  return path.join(getEpicsDir(workingDir), epicName);
}

/**
 * Get epic.md file path for a specific epic
 */
export function getEpicFilePath(epicName: string, workingDir?: string): string {
  return path.join(getEpicDir(epicName, workingDir), 'epic.md');
}

/**
 * Get PRD file path for a specific feature
 */
export function getPrdFilePath(featureName: string, workingDir?: string): string {
  return path.join(getPrdsDir(workingDir), `${featureName}.md`);
}

/**
 * Get task file path within an epic
 */
export function getTaskFilePath(
  epicName: string,
  taskNumber: string,
  workingDir?: string
): string {
  return path.join(getEpicDir(epicName, workingDir), `${taskNumber}.md`);
}

/**
 * Initialize .claude directory structure
 * Creates:
 * - .claude/
 * - .claude/epics/
 * - .claude/prds/
 *
 * Best Practice: Uses ensureDir() which creates parent dirs if needed
 */
export async function initClaudeStructure(workingDir?: string): Promise<void> {
  const claudeDir = getClaudeDir(workingDir);
  const epicsDir = getEpicsDir(workingDir);
  const prdsDir = getPrdsDir(workingDir);

  await fs.ensureDir(claudeDir);
  await fs.ensureDir(epicsDir);
  await fs.ensureDir(prdsDir);
}

/**
 * Check if .claude structure is initialized
 */
export async function isClaudeInitialized(workingDir?: string): Promise<boolean> {
  const claudeDir = getClaudeDir(workingDir);
  const epicsDir = getEpicsDir(workingDir);
  const prdsDir = getPrdsDir(workingDir);

  const [claudeExists, epicsExists, prdsExists] = await Promise.all([
    fs.pathExists(claudeDir),
    fs.pathExists(epicsDir),
    fs.pathExists(prdsDir),
  ]);

  return claudeExists && epicsExists && prdsExists;
}

/**
 * Create epic directory
 * Best Practice: Uses ensureDir() for automatic parent creation
 */
export async function createEpicDir(epicName: string, workingDir?: string): Promise<string> {
  const epicDir = getEpicDir(epicName, workingDir);
  await fs.ensureDir(epicDir);
  return epicDir;
}

/**
 * Check if epic exists
 */
export async function epicExists(epicName: string, workingDir?: string): Promise<boolean> {
  const epicFilePath = getEpicFilePath(epicName, workingDir);
  return fs.pathExists(epicFilePath);
}

/**
 * Check if PRD exists
 */
export async function prdExists(featureName: string, workingDir?: string): Promise<boolean> {
  const prdFilePath = getPrdFilePath(featureName, workingDir);
  return fs.pathExists(prdFilePath);
}

/**
 * Read file content
 * Best Practice: Returns string with utf8 encoding
 */
export async function readFile(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath, 'utf8');
  return content;
}

/**
 * Write file content
 * Best Practice: Uses outputFile() which creates parent dirs if needed
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.outputFile(filePath, content, 'utf8');
}

/**
 * List all epics
 * Returns epic names (directory names)
 */
export async function listEpics(workingDir?: string): Promise<string[]> {
  const epicsDir = getEpicsDir(workingDir);

  if (!(await fs.pathExists(epicsDir))) {
    return [];
  }

  const entries = await fs.readdir(epicsDir, { withFileTypes: true });
  return entries
    .filter((entry: fs.Dirent) => entry.isDirectory())
    .map((entry: fs.Dirent) => entry.name);
}

/**
 * List all PRDs
 * Returns PRD names (without .md extension)
 */
export async function listPrds(workingDir?: string): Promise<string[]> {
  const prdsDir = getPrdsDir(workingDir);

  if (!(await fs.pathExists(prdsDir))) {
    return [];
  }

  const entries = await fs.readdir(prdsDir, { withFileTypes: true });
  return entries
    .filter((entry: fs.Dirent) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry: fs.Dirent) => entry.name.replace(/\.md$/, ''));
}

/**
 * List all tasks in an epic
 * Returns task file names (e.g., ['001.md', '002.md'])
 */
export async function listTasks(epicName: string, workingDir?: string): Promise<string[]> {
  const epicDir = getEpicDir(epicName, workingDir);

  if (!(await fs.pathExists(epicDir))) {
    return [];
  }

  const entries = await fs.readdir(epicDir, { withFileTypes: true });
  return entries
    .filter((entry: fs.Dirent) => entry.isFile() && entry.name.match(/^\d{3}\.md$/))
    .map((entry: fs.Dirent) => entry.name)
    .sort();
}

/**
 * Delete epic directory and all contents
 * Best Practice: Uses remove() which handles directories recursively
 */
export async function deleteEpic(epicName: string, workingDir?: string): Promise<void> {
  const epicDir = getEpicDir(epicName, workingDir);
  await fs.remove(epicDir);
}

/**
 * Delete PRD file
 */
export async function deletePrd(featureName: string, workingDir?: string): Promise<void> {
  const prdFilePath = getPrdFilePath(featureName, workingDir);
  await fs.remove(prdFilePath);
}

/**
 * Copy file
 * Best Practice: Uses copy() with overwrite option
 */
export async function copyFile(src: string, dest: string, overwrite: boolean = false): Promise<void> {
  await fs.copy(src, dest, { overwrite });
}

/**
 * Move file
 * Best Practice: Uses move() which works across devices
 */
export async function moveFile(src: string, dest: string, overwrite: boolean = false): Promise<void> {
  await fs.move(src, dest, { overwrite });
}

/**
 * Ensure directory exists
 * Best Practice: Uses ensureDir() which is idempotent
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Check if path exists
 */
export async function pathExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}
