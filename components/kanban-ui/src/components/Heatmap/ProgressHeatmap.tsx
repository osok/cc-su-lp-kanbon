/**
 * ProgressHeatmap component.
 * Horizontal bars showing completion progress per sequence.
 * Requirements: FR-HMP-001 through FR-HMP-004
 */
import React from 'react';
import type { Sequence, StatusType } from '@kanban/types';
import styles from './ProgressHeatmap.module.css';

interface ProgressHeatmapProps {
  sequences: Sequence[];
  onSelectSequence: (sequenceId: string) => void;
}

const STATUS_ORDER: StatusType[] = ['complete', 'in-progress', 'blocked', 'pending', 'deferred'];

const STATUS_COLORS: Record<StatusType, string> = {
  'complete': 'var(--status-complete)',
  'in-progress': 'var(--status-in-progress)',
  'blocked': 'var(--status-blocked)',
  'pending': 'var(--status-pending)',
  'deferred': 'var(--status-deferred)',
};

export function ProgressHeatmap({ sequences, onSelectSequence }: ProgressHeatmapProps): React.ReactElement {
  if (sequences.length === 0) return <></>;

  return (
    <div className={styles.heatmap}>
      {sequences.map(seq => {
        const total = seq.totalTasks || 1;
        const pct = Math.round((seq.completedTasks / total) * 100);

        return (
          <button
            key={seq.sequenceId}
            className={styles.row}
            onClick={() => onSelectSequence(seq.sequenceId)}
            title={`${seq.sequenceId} - ${seq.sequenceName}: ${seq.completedTasks}/${seq.totalTasks} (${pct}%)`}
          >
            <span className={styles.label}>
              {seq.sequenceId} - {seq.sequenceName}
            </span>
            <div className={styles.bar}>
              {STATUS_ORDER.map(status => {
                const count = seq.statusBreakdown[status] || 0;
                if (count === 0) return null;
                const width = (count / total) * 100;
                return (
                  <div
                    key={status}
                    className={styles.segment}
                    style={{
                      width: `${width}%`,
                      backgroundColor: STATUS_COLORS[status],
                    }}
                    title={`${status}: ${count}`}
                  />
                );
              })}
            </div>
            <span className={styles.ratio}>
              {seq.completedTasks}/{seq.totalTasks}
            </span>
            <span className={styles.pct}>{pct}%</span>
          </button>
        );
      })}
    </div>
  );
}
