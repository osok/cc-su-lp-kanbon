/**
 * FilterBar component.
 * Horizontal tab bar for sequence filtering.
 * Requirements: FR-FLT-001 through FR-FLT-005
 */
import React from 'react';
import type { Sequence } from '@kanban/types';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  sequences: Sequence[];
  selectedSequence: string | null;
  totalTasks: number;
  onSelectSequence: (sequenceId: string | null) => void;
}

export function FilterBar({ sequences, selectedSequence, totalTasks, onSelectSequence }: FilterBarProps): React.ReactElement {
  return (
    <div className={styles.filterBar} role="tablist" aria-label="Sequence filter">
      <button
        className={`${styles.tab} ${selectedSequence === null ? styles.active : ''}`}
        onClick={() => onSelectSequence(null)}
        role="tab"
        aria-selected={selectedSequence === null}
      >
        All ({totalTasks})
      </button>
      {sequences.map(seq => (
        <button
          key={seq.sequenceId}
          className={`${styles.tab} ${selectedSequence === seq.sequenceId ? styles.active : ''}`}
          onClick={() => onSelectSequence(seq.sequenceId)}
          role="tab"
          aria-selected={selectedSequence === seq.sequenceId}
        >
          {seq.sequenceId} - {seq.sequenceName}
          <span className={styles.progress}>
            {seq.completedTasks}/{seq.totalTasks}
          </span>
        </button>
      ))}
    </div>
  );
}
