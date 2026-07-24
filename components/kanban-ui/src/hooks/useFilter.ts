/**
 * useFilter hook.
 * Manages sequence filter state with persistence across polls.
 * Enhanced with sequence-level filtering modes, name text filtering,
 * and sequence sort direction.
 *
 * Sequence identity: sequenceId is NOT unique across files (multiple files can
 * share a numeric prefix, and files without one all fall back to "000"), so
 * sequences are keyed by sourceFile everywhere in the UI.
 * Requirements: FR-FLT-003, FR-FLT-004
 */
import { useState, useMemo, useCallback } from 'react';
import type { Task, Sequence } from '@kanban/types';

export type SequenceFilterMode = 'all' | 'hideComplete' | 'lastN' | 'currentOnly' | 'hasBlocked';

export type SortDirection = 'asc' | 'desc';

export interface SequenceFilterConfig {
  mode: SequenceFilterMode;
  lastN: number;
}

interface UseFilterResult {
  /** sourceFile of the selected sequence, or null for all.
   * Reads as null while the selected sequence is hidden by the active filters. */
  selectedSequence: string | null;
  setSelectedSequence: (sourceFile: string | null) => void;
  filteredTasks: Task[];
  filterConfig: SequenceFilterConfig;
  setFilterConfig: (config: SequenceFilterConfig) => void;
  filteredSequences: Sequence[];
  /** Number of tasks in all visible sequences, ignoring tab selection */
  visibleTaskCount: number;
  nameFilter: string;
  setNameFilter: (text: string) => void;
  sortDirection: SortDirection;
  toggleSortDirection: () => void;
}

/** Normalize filter text: ignore glob-style asterisks, match case-insensitively */
function normalizeFilter(text: string): string {
  return text.replace(/\*/g, '').trim().toLowerCase();
}

/** A sequence matches on its name, including the "id - name" form shown in the UI */
function sequenceMatchesText(seq: Sequence, needle: string): boolean {
  const haystack = `${seq.sequenceId} - ${seq.sequenceName}`.toLowerCase();
  return haystack.includes(needle) || haystack.replace(' - ', ' ').includes(needle);
}

function compareSequences(a: Sequence, b: Sequence): number {
  return a.sequenceId.localeCompare(b.sequenceId) || a.sourceFile.localeCompare(b.sourceFile);
}

export function useFilter(tasks: Task[], sequences: Sequence[]): UseFilterResult {
  const [selectedSequence, setSelectedSequenceState] = useState<string | null>(null);
  const [filterConfig, setFilterConfigState] = useState<SequenceFilterConfig>({
    mode: 'all',
    lastN: 5,
  });
  const [nameFilter, setNameFilterState] = useState('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const setSelectedSequence = useCallback((sourceFile: string | null) => {
    setSelectedSequenceState(sourceFile);
  }, []);

  const setFilterConfig = useCallback((config: SequenceFilterConfig) => {
    setFilterConfigState(config);
  }, []);

  const setNameFilter = useCallback((text: string) => {
    setNameFilterState(text);
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSortDirection(prev => (prev === 'desc' ? 'asc' : 'desc'));
  }, []);

  const normalizedFilter = normalizeFilter(nameFilter);

  // Canonical oldest-first order with sourceFile tiebreaker so duplicate
  // sequenceIds keep a stable order. Filtering happens in this fixed order;
  // sortDirection is applied only at the display step so it can never change
  // WHICH sequences are visible (e.g. lastN must mean the newest N either way).
  const sortedAsc = useMemo(() => {
    return [...sequences].sort(compareSequences);
  }, [sequences]);

  // Apply the text filter before the mode filter so lastN means "last N matching lists"
  const textFilteredSequences = useMemo(() => {
    if (!normalizedFilter) return sortedAsc;
    return sortedAsc.filter(s => sequenceMatchesText(s, normalizedFilter));
  }, [sortedAsc, normalizedFilter]);

  // Compute which sequences pass the filter (still oldest-first)
  const visibleSequences = useMemo(() => {
    switch (filterConfig.mode) {
      case 'hideComplete':
        return textFilteredSequences.filter(s => s.completedTasks < s.totalTasks);
      case 'lastN':
        return textFilteredSequences.slice(-filterConfig.lastN);
      case 'currentOnly':
        if (selectedSequence) {
          return textFilteredSequences.filter(s => s.sourceFile === selectedSequence);
        }
        return textFilteredSequences;
      case 'hasBlocked':
        return textFilteredSequences.filter(s => (s.statusBreakdown['blocked'] || 0) > 0);
      case 'all':
      default:
        return textFilteredSequences;
    }
  }, [textFilteredSequences, filterConfig, selectedSequence]);

  // Display order
  const filteredSequences = useMemo(() => {
    return sortDirection === 'desc' ? [...visibleSequences].reverse() : visibleSequences;
  }, [visibleSequences, sortDirection]);

  // Build set of visible sequence source files for task filtering
  const visibleSourceFiles = useMemo(() => {
    return new Set(visibleSequences.map(s => s.sourceFile));
  }, [visibleSequences]);

  // A tab selection that the current filters hide is ignored (instead of
  // silently emptying the board); it comes back if the filters reveal it again.
  const effectiveSelection =
    selectedSequence && visibleSourceFiles.has(selectedSequence) ? selectedSequence : null;

  // Tasks belonging to visible sequences, ignoring tab selection
  const visibleTasks = useMemo(() => {
    if (filterConfig.mode === 'all' && !normalizedFilter) return tasks;
    return tasks.filter(task => visibleSourceFiles.has(task.sourceFile));
  }, [tasks, filterConfig.mode, normalizedFilter, visibleSourceFiles]);

  const filteredTasks = useMemo(() => {
    const result = effectiveSelection
      ? visibleTasks.filter(task => task.sourceFile === effectiveSelection)
      : visibleTasks;

    // Order tasks by sequence in the selected direction (stable within a sequence)
    return [...result].sort((a, b) => {
      const cmp =
        a.sequenceId.localeCompare(b.sequenceId) || a.sourceFile.localeCompare(b.sourceFile);
      return sortDirection === 'desc' ? -cmp : cmp;
    });
  }, [visibleTasks, effectiveSelection, sortDirection]);

  return {
    selectedSequence: effectiveSelection,
    setSelectedSequence,
    filteredTasks,
    filterConfig,
    setFilterConfig,
    filteredSequences,
    visibleTaskCount: visibleTasks.length,
    nameFilter,
    setNameFilter,
    sortDirection,
    toggleSortDirection,
  };
}
