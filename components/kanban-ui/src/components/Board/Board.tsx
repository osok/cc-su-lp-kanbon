/**
 * Board component (flat Kanban view).
 * Renders 5 status columns with filtered tasks.
 * Requirements: FR-KBN-001, FR-KBN-005, FR-KBN-006
 */
import React, { useMemo } from 'react';
import type { Task, TaskChange, StatusType } from '@kanban/types';
import { Column } from '../Column/Column.js';
import styles from './Board.module.css';

const COLUMN_ORDER: StatusType[] = ['pending', 'in-progress', 'blocked', 'deferred', 'complete'];

interface BoardProps {
  tasks: Task[];
  changes: TaskChange[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

export function Board({ tasks, changes, selectedTaskId, onSelectTask }: BoardProps): React.ReactElement {
  const tasksByStatus = useMemo(() => {
    const grouped: Record<StatusType, Task[]> = {
      'pending': [],
      'in-progress': [],
      'blocked': [],
      'deferred': [],
      'complete': [],
    };
    for (const task of tasks) {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
        grouped['pending'].push(task);
      }
    }
    return grouped;
  }, [tasks]);

  return (
    <div className={styles.board}>
      {COLUMN_ORDER.map(status => (
        <Column
          key={status}
          status={status}
          tasks={tasksByStatus[status]}
          changes={changes}
          selectedTaskId={selectedTaskId}
          onSelectTask={onSelectTask}
        />
      ))}
    </div>
  );
}
