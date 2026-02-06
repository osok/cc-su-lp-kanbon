/**
 * EmptyState component.
 * Shown when directory is configured but no task files found.
 * Requirements: UR-005
 */
import React from 'react';
import styles from './States.module.css';

interface EmptyStateProps {
  directory: string | null;
}

export function EmptyState({ directory }: EmptyStateProps): React.ReactElement {
  return (
    <div className={styles.stateContainer}>
      <div className={styles.stateContent}>
        <h2 className={styles.stateTitle}>No task files found</h2>
        {directory && (
          <p className={styles.stateDir}>in: {directory}</p>
        )}
        <p className={styles.stateMessage}>
          Make sure the directory contains markdown (.md) files
          with task tables in the expected format.
        </p>
      </div>
    </div>
  );
}
