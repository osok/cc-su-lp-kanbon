/**
 * md-parser public API.
 * Isolated, zero-dependency markdown task file parser.
 * Requirements: NR-MNT-001
 */
import type { ParseResult, Task, StatusType } from '@kanban/types';
import { parseTable } from './table-parser.js';
import { normalizeStatus } from './status-normalizer.js';
import { parseDependencies } from './dependency-parser.js';
import { extractSequenceId, extractSequenceName } from './sequence-extractor.js';

/**
 * Parse a markdown task file into structured data.
 *
 * @param content - The raw markdown file content
 * @param filename - The filename (used for sequence extraction)
 * @returns ParseResult with tasks, sequence metadata, and warnings
 */
export function parseTaskFile(content: string, filename: string): ParseResult {
  const { rows, warnings } = parseTable(content);

  const sequenceId = extractSequenceId(filename, content);
  const sequenceName = extractSequenceName(content, filename);

  const tasks: Task[] = rows.map(row => ({
    taskId: row.id,
    taskName: row.task,
    status: normalizeStatus(row.status),
    blockedBy: parseDependencies(row.blockedBy),
    agent: row.agent,
    priority: row.priority,
    sequenceId,
    sequenceName,
    sourceFile: filename,
  }));

  // Compute sequence stats
  const statusBreakdown: Record<StatusType, number> = {
    'complete': 0,
    'in-progress': 0,
    'pending': 0,
    'blocked': 0,
    'deferred': 0,
  };

  for (const task of tasks) {
    statusBreakdown[task.status]++;
  }

  return {
    tasks,
    sequence: {
      sequenceId,
      sequenceName,
      sourceFile: filename,
      totalTasks: tasks.length,
      completedTasks: statusBreakdown['complete'],
      statusBreakdown,
      lastModified: new Date().toISOString(),
    },
    warnings,
  };
}

// Re-export utility functions for testing
export { normalizeStatus } from './status-normalizer.js';
export { parseDependencies } from './dependency-parser.js';
export { extractSequenceId, extractSequenceName } from './sequence-extractor.js';
