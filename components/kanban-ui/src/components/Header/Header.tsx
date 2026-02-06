/**
 * Header component with application title and controls.
 * Requirements: FR-THM-002, FR-SWM-004, FR-DEP-005, FR-POL-003, FR-DIR-003
 */
import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  lastUpdated: string | null;
  theme: 'light' | 'dark';
  viewMode: 'flat' | 'swimlane';
  showDependencies: boolean;
  onToggleTheme: () => void;
  onToggleViewMode: () => void;
  onToggleDependencies: () => void;
  onOpenDirectoryPicker: () => void;
}

export function Header({
  lastUpdated,
  theme,
  viewMode,
  showDependencies,
  onToggleTheme,
  onToggleViewMode,
  onToggleDependencies,
  onOpenDirectoryPicker,
}: HeaderProps): React.ReactElement {
  const formatTime = (isoString: string | null): string => {
    if (!isoString) return 'Never';
    try {
      return new Date(isoString).toLocaleTimeString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>AI Tester Kanban Dashboard</h1>

      <span className={styles.lastUpdated} title="Last successful data refresh">
        Last updated: {formatTime(lastUpdated)}
      </span>

      <div className={styles.controls}>
        <button
          className={styles.controlBtn}
          onClick={onToggleViewMode}
          title={viewMode === 'flat' ? 'Switch to swimlane view' : 'Switch to flat view'}
          aria-label={viewMode === 'flat' ? 'Switch to swimlane view' : 'Switch to flat view'}
        >
          {viewMode === 'flat' ? 'Swimlane' : 'Flat'}
        </button>

        <button
          className={`${styles.controlBtn} ${showDependencies ? styles.active : ''}`}
          onClick={onToggleDependencies}
          title={showDependencies ? 'Hide dependencies' : 'Show dependencies'}
          aria-label={showDependencies ? 'Hide dependencies' : 'Show dependencies'}
        >
          Dependencies
        </button>

        <button
          className={styles.controlBtn}
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>

        <button
          className={styles.controlBtn}
          onClick={onOpenDirectoryPicker}
          title="Change watched directory"
          aria-label="Change watched directory"
        >
          Directory
        </button>
      </div>
    </header>
  );
}
