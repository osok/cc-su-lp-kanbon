/**
 * SequenceFilterControls component.
 * Dropdown + lastN input for filtering the sequence list.
 * Rendered above the ProgressHeatmap in the main layout.
 * Requirements: FR-FLT-001 through FR-FLT-005
 */
import React, { useCallback } from 'react';
import type { SequenceFilterConfig, SequenceFilterMode, SortDirection } from '../../hooks/useFilter.js';
import styles from './SequenceFilterControls.module.css';

interface SequenceFilterControlsProps {
  filterConfig: SequenceFilterConfig;
  onFilterChange: (config: SequenceFilterConfig) => void;
  nameFilter: string;
  onNameFilterChange: (text: string) => void;
  sortDirection: SortDirection;
  onToggleSortDirection: () => void;
  visibleCount: number;
  totalCount: number;
}

const FILTER_OPTIONS: { value: SequenceFilterMode; label: string }[] = [
  { value: 'all', label: 'All Lists' },
  { value: 'hideComplete', label: 'Hide Complete' },
  { value: 'lastN', label: 'Last N' },
  { value: 'currentOnly', label: 'Current Only' },
  { value: 'hasBlocked', label: 'Has Blocked' },
];

export function SequenceFilterControls({
  filterConfig,
  onFilterChange,
  nameFilter,
  onNameFilterChange,
  sortDirection,
  onToggleSortDirection,
  visibleCount,
  totalCount,
}: SequenceFilterControlsProps): React.ReactElement {
  const handleModeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filterConfig, mode: e.target.value as SequenceFilterMode });
  }, [filterConfig, onFilterChange]);

  const handleLastNChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      onFilterChange({ ...filterConfig, lastN: value });
    }
  }, [filterConfig, onFilterChange]);

  const handleNameFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onNameFilterChange(e.target.value);
  }, [onNameFilterChange]);

  return (
    <div className={styles.controls}>
      <label className={styles.label} htmlFor="seq-filter-mode">Filter:</label>
      <select
        id="seq-filter-mode"
        className={styles.select}
        value={filterConfig.mode}
        onChange={handleModeChange}
        aria-label="Filter mode"
      >
        {FILTER_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {filterConfig.mode === 'lastN' && (
        <input
          type="number"
          className={styles.lastNInput}
          value={filterConfig.lastN}
          onChange={handleLastNChange}
          min={1}
          max={99}
          aria-label="Number of recent task lists"
        />
      )}
      <div className={styles.searchWrap}>
        <input
          type="search"
          className={styles.searchInput}
          value={nameFilter}
          onChange={handleNameFilterChange}
          placeholder="Filter by name (e.g. EVA)"
          aria-label="Filter by name"
        />
        {nameFilter && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => onNameFilterChange('')}
            aria-label="Clear name filter"
          >
            &times;
          </button>
        )}
      </div>
      <button
        type="button"
        className={styles.sortButton}
        onClick={onToggleSortDirection}
        aria-label="Toggle sort direction"
        title={sortDirection === 'desc' ? 'Newest first — click for oldest first' : 'Oldest first — click for newest first'}
      >
        {sortDirection === 'desc' ? '↓ Desc' : '↑ Asc'}
      </button>
      <span className={styles.count}>
        {visibleCount === totalCount
          ? `${totalCount} list${totalCount !== 1 ? 's' : ''}`
          : `${visibleCount} of ${totalCount} lists`}
      </span>
    </div>
  );
}
