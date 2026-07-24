/**
 * Unique task identity for React keys, selection, and DOM lookups.
 * taskId alone repeats across files (every list has a TASK-001) and
 * sequenceId is not unique either, so identity is sourceFile + taskId.
 */
import type { Task } from '@kanban/types';

export function taskKey(task: Pick<Task, 'sourceFile' | 'taskId'>): string {
  return `${task.sourceFile}:${task.taskId}`;
}
