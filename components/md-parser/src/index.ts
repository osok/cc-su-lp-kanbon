/**
 * md-parser public API.
 * Isolated, zero-dependency markdown task file parser.
 * Requirements: NR-MNT-001
 */
import type { ParseResult, Task, TaskDetail, StatusType } from '@kanban/types';
import { parseTable } from './table-parser.js';
import { normalizeStatus } from './status-normalizer.js';
import { parseDependencies } from './dependency-parser.js';
import { extractSequenceId, extractSequenceName } from './sequence-extractor.js';
import { parseTaskDetails } from './detail-parser.js';

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

  // Duplicate task IDs break change detection and dependency references
  const seenIds = new Set<string>();
  for (const task of tasks) {
    if (seenIds.has(task.taskId)) {
      warnings.push(`Duplicate task ID "${task.taskId}"`);
    }
    seenIds.add(task.taskId);
  }

  // Merge task detail blocks into tasks
  const detailMap = parseTaskDetails(content);
  if (detailMap.size > 0) {
    for (const task of tasks) {
      const detail = detailMap.get(task.taskId) ??
        findDetailByNumericSuffix(task.taskId, detailMap);
      if (detail) {
        task.details = detail;
      }
    }
  }

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

/**
 * Match a full task ID (e.g., "TASK-001-015") to a detail map key
 * which may be a shorter form (e.g., "T015") by comparing numeric suffixes.
 */
function findDetailByNumericSuffix(
  taskId: string,
  detailMap: Map<string, TaskDetail>,
): TaskDetail | undefined {
  const taskNum = taskId.match(/(\d+)$/)?.[1];
  if (!taskNum) return undefined;

  for (const [key, detail] of detailMap) {
    const keyNum = key.match(/(\d+)$/)?.[1];
    if (keyNum && keyNum === taskNum) {
      return detail;
    }
  }
  return undefined;
}

// Re-export utility functions for testing
export { normalizeStatus } from './status-normalizer.js';
export { parseDependencies } from './dependency-parser.js';
export { extractSequenceId, extractSequenceName } from './sequence-extractor.js';
export { parseTaskDetails } from './detail-parser.js';
