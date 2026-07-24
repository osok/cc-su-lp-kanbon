/**
 * Column component.
 * Renders a single Kanban status column with task count and scrollable card list.
 * Requirements: FR-KBN-004, FR-KBN-005
 */
import React from 'react';
import type { Task, TaskChange, StatusType } from '@kanban/types';
import { TaskCard } from '../Card/TaskCard.js';
import { getStatusColor } from '../../utils/colors.js';
import { taskKey } from '../../utils/task-key.js';
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
  onOpenDetail?: (task: Task) => void;
}

export function Column({ status, tasks, changes, selectedTaskId, onSelectTask, onOpenDetail }: ColumnProps): React.ReactElement {
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
        {(() => {
          // Files can contain repeated task IDs; suffix repeats so React keys
          // stay unique (stable across re-sorts since sorting is stable)
          const seen = new Map<string, number>();
          return tasks.map(task => {
            const key = taskKey(task);
            const n = seen.get(key) ?? 0;
            seen.set(key, n + 1);
            return (
              <TaskCard
                key={n === 0 ? key : `${key}#${n}`}
                task={task}
                changes={changes}
                isSelected={selectedTaskId === key}
                onSelect={onSelectTask}
                onOpenDetail={onOpenDetail}
              />
            );
          });
        })()}
      </div>
    </div>
  );
}
