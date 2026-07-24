/**
 * FilterBar component.
 * Horizontal tab bar for sequence selection.
 * Requirements: FR-FLT-001 through FR-FLT-005
 */
import React from 'react';
import type { Sequence } from '@kanban/types';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  sequences: Sequence[];
  /** sourceFile of the selected sequence — the unique sequence key */
  selectedSequence: string | null;
  totalTasks: number;
  onSelectSequence: (sourceFile: string | null) => void;
}

export function FilterBar({
  sequences,
  selectedSequence,
  totalTasks,
  onSelectSequence,
}: FilterBarProps): React.ReactElement {
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
          key={seq.sourceFile}
          className={`${styles.tab} ${selectedSequence === seq.sourceFile ? styles.active : ''}`}
          onClick={() => onSelectSequence(seq.sourceFile)}
          role="tab"
          aria-selected={selectedSequence === seq.sourceFile}
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
