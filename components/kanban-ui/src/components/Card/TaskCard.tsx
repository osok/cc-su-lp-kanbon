/**
 * TaskCard component.
 * Displays a single task as a card with sequence color coding.
 * Requirements: FR-KBN-002, FR-KBN-003, FR-POL-004, FR-KBN-006
 */
import React, { useCallback } from 'react';
import type { Task, TaskChange } from '@kanban/types';
import { getSequenceColor } from '../../utils/colors.js';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  changes: TaskChange[];
  isSelected: boolean;
  onSelect: (taskId: string) => void;
}

export function TaskCard({ task, changes, isSelected, onSelect }: TaskCardProps): React.ReactElement {
  const sequenceColor = getSequenceColor(task.sequenceId);
  const isChanged = changes.some(c => c.taskId === task.taskId);

  const handleClick = useCallback(() => {
    onSelect(task.taskId);
  }, [onSelect, task.taskId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(task.taskId);
    }
  }, [onSelect, task.taskId]);

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
      data-task-id={task.taskId}
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
