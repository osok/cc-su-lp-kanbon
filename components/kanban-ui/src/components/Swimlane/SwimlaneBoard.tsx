/**
 * SwimlaneBoard component.
 * Groups tasks by agent into horizontal lanes, each with status columns.
 * Requirements: FR-SWM-001 through FR-SWM-003
 */
import React, { useMemo } from 'react';
import type { Task, TaskChange, StatusType } from '@kanban/types';
import { Column } from '../Column/Column.js';
import styles from './SwimlaneBoard.module.css';

const COLUMN_ORDER: StatusType[] = ['pending', 'in-progress', 'blocked', 'deferred', 'complete'];

interface SwimlaneBoardProps {
  tasks: Task[];
  changes: TaskChange[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

interface AgentGroup {
  agent: string;
  tasks: Task[];
  tasksByStatus: Record<StatusType, Task[]>;
}

export function SwimlaneBoard({ tasks, changes, selectedTaskId, onSelectTask }: SwimlaneBoardProps): React.ReactElement {
  const agentGroups = useMemo((): AgentGroup[] => {
    const groupMap = new Map<string, Task[]>();

    for (const task of tasks) {
      const agent = task.agent || 'Unassigned';
      const group = groupMap.get(agent);
      if (group) {
        group.push(task);
      } else {
        groupMap.set(agent, [task]);
      }
    }

    return Array.from(groupMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([agent, agentTasks]) => {
        const tasksByStatus: Record<StatusType, Task[]> = {
          'pending': [],
          'in-progress': [],
          'blocked': [],
          'deferred': [],
          'complete': [],
        };
        for (const task of agentTasks) {
          if (tasksByStatus[task.status]) {
            tasksByStatus[task.status].push(task);
          } else {
            tasksByStatus['pending'].push(task);
          }
        }
        return { agent, tasks: agentTasks, tasksByStatus };
      });
  }, [tasks]);

  return (
    <div className={styles.swimlaneBoard}>
      {agentGroups.map(group => (
        <div key={group.agent} className={styles.swimlane}>
          <div className={styles.header}>
            <span className={styles.agentName}>{group.agent}</span>
            <span className={styles.count}>({group.tasks.length})</span>
          </div>
          <div className={styles.columns}>
            {COLUMN_ORDER.map(status => (
              <Column
                key={status}
                status={status}
                tasks={group.tasksByStatus[status]}
                changes={changes}
                selectedTaskId={selectedTaskId}
                onSelectTask={onSelectTask}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
