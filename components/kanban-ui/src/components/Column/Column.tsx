/**
 * Column component.
 * Renders a single Kanban status column with task count and scrollable card list.
 * Requirements: FR-KBN-004, FR-KBN-005
 */
import React from 'react';
import type { Task, TaskChange, StatusType } from '@kanban/types';
import { TaskCard } from '../Card/TaskCard.js';
import { getStatusColor } from '../../utils/colors.js';
import styles from './Column.module.css';

const STATUS_LABELS: Record<StatusType, string> = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'blocked': 'Blocked',
  'deferred': 'Deferred',
  'complete': 'Complete',
};

interface ColumnProps {
  status: StatusType;
  tasks: Task[];
  changes: TaskChange[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

export function Column({ status, tasks, changes, selectedTaskId, onSelectTask }: ColumnProps): React.ReactElement {
  const statusColor = getStatusColor(status);

  return (
    <div className={styles.column}>
      <div className={styles.header} style={{ borderBottomColor: statusColor }}>
        <span className={styles.title}>{STATUS_LABELS[status]}</span>
        <span className={styles.count} style={{ backgroundColor: statusColor }}>
          {tasks.length}
        </span>
      </div>
      <div className={styles.body}>
        {tasks.map(task => (
          <TaskCard
            key={`${task.sequenceId}:${task.taskId}`}
            task={task}
            changes={changes}
            isSelected={selectedTaskId === task.taskId}
            onSelect={onSelectTask}
          />
        ))}
      </div>
    </div>
  );
}
