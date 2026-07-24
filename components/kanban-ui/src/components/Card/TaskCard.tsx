/**
 * TaskCard component.
 * Displays a single task as a card with sequence color coding.
 * Requirements: FR-KBN-002, FR-KBN-003, FR-POL-004, FR-KBN-006
 */
import React, { useCallback } from 'react';
import type { Task, TaskChange } from '@kanban/types';
import { getSequenceColor } from '../../utils/colors.js';
import { taskKey } from '../../utils/task-key.js';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  changes: TaskChange[];
  isSelected: boolean;
  /** Receives the task's unique key (sourceFile:taskId) */
  onSelect: (key: string) => void;
  onOpenDetail?: (task: Task) => void;
}

export function TaskCard({ task, changes, isSelected, onSelect, onOpenDetail }: TaskCardProps): React.ReactElement {
  const sequenceColor = getSequenceColor(task.sequenceId, task.sourceFile);
  const isChanged = changes.some(
    c => c.taskId === task.taskId && c.sourceFile === task.sourceFile
  );

  const handleClick = useCallback(() => {
    onSelect(taskKey(task));
    onOpenDetail?.(task);
  }, [onSelect, onOpenDetail, task]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(taskKey(task));
      onOpenDetail?.(task);
    }
  }, [onSelect, onOpenDetail, task]);

  return (
    <div
      className={`${styles.card} ${isChanged ? 'card-changed' : ''} ${isSelected ? styles.selected : ''}`}
      style={{
        borderLeftColor: sequenceColor,
        '--highlight-color': sequenceColor,
      } as React.CSSProperties}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Task ${task.taskId}: ${task.taskName}`}
      data-task-id={taskKey(task)}
    >
      <div className={styles.taskId}>{task.taskId}</div>
      <div className={styles.taskName} title={task.taskName}>{task.taskName}</div>
      <div className={styles.meta}>
        <span className={styles.agent}>{task.agent}</span>
        {task.priority && <span className={styles.priority}>{task.priority}</span>}
      </div>
    </div>
  );
}
