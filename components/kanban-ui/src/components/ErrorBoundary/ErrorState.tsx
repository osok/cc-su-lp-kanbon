/**
 * ErrorState component.
 * Shown when the watched directory becomes inaccessible.
 * Requirements: UR-006
 */
import React from 'react';
import styles from './States.module.css';

interface ErrorStateProps {
  error: string;
  onChangeDirectory: () => void;
}

export function ErrorState({ error, onChangeDirectory }: ErrorStateProps): React.ReactElement {
  return (
    <div className={styles.stateContainer}>
      <div className={styles.stateContent}>
        <h2 className={styles.stateTitle}>Error</h2>
        <p className={styles.stateMessage}>{error}</p>
        <p className={styles.stateHint}>
          The directory may have been moved or permissions changed.
        </p>
        <button className={styles.stateBtn} onClick={onChangeDirectory}>
          Change Directory
        </button>
      </div>
    </div>
  );
}
