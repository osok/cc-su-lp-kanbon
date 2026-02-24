/**
 * useFilter hook.
 * Manages sequence filter state with persistence across polls.
 * Enhanced with sequence-level filtering modes.
 * Requirements: FR-FLT-003, FR-FLT-004
 */
import { useState, useMemo, useCallback } from 'react';
import type { Task, Sequence } from '@kanban/types';

export type SequenceFilterMode = 'all' | 'hideComplete' | 'lastN' | 'currentOnly' | 'hasBlocked';

export interface SequenceFilterConfig {
  mode: SequenceFilterMode;
  lastN: number;
}

interface UseFilterResult {
  selectedSequence: string | null;
  setSelectedSequence: (sequenceId: string | null) => void;
  filteredTasks: Task[];
  filterConfig: SequenceFilterConfig;
  setFilterConfig: (config: SequenceFilterConfig) => void;
  filteredSequences: Sequence[];
}

export function useFilter(tasks: Task[], sequences: Sequence[]): UseFilterResult {
  const [selectedSequence, setSelectedSequenceState] = useState<string | null>(null);
  const [filterConfig, setFilterConfigState] = useState<SequenceFilterConfig>({
    mode: 'all',
    lastN: 5,
  });

  const setSelectedSequence = useCallback((sequenceId: string | null) => {
    setSelectedSequenceState(sequenceId);
  }, []);

  const setFilterConfig = useCallback((config: SequenceFilterConfig) => {
    setFilterConfigState(config);
  }, []);

  // Always sort sequences descending by sequenceId (newest first)
  const sortedSequences = useMemo(() => {
    return [...sequences].sort((a, b) => b.sequenceId.localeCompare(a.sequenceId));
  }, [sequences]);

  // Compute which sequences pass the filter
  const filteredSequences = useMemo(() => {
    switch (filterConfig.mode) {
      case 'hideComplete':
        return sortedSequences.filter(s => s.completedTasks < s.totalTasks);
      case 'lastN':
        return sortedSequences.slice(0, filterConfig.lastN);
      case 'currentOnly':
        if (selectedSequence) {
          return sortedSequences.filter(s => s.sequenceId === selectedSequence);
        }
        return sortedSequences;
      case 'hasBlocked':
        return sortedSequences.filter(s => (s.statusBreakdown['blocked'] || 0) > 0);
      case 'all':
      default:
        return sortedSequences;
    }
  }, [sortedSequences, filterConfig, selectedSequence]);

  // Build set of visible sequence IDs for task filtering
  const visibleSequenceIds = useMemo(() => {
    return new Set(filteredSequences.map(s => s.sequenceId));
  }, [filteredSequences]);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filter by visible sequences (from sequence-level filter)
    if (filterConfig.mode !== 'all') {
      result = result.filter(task => visibleSequenceIds.has(task.sequenceId));
    }

    // Then filter by selected individual sequence tab
    if (selectedSequence) {
      result = result.filter(task => task.sequenceId === selectedSequence);
    }

    return result;
  }, [tasks, selectedSequence, filterConfig.mode, visibleSequenceIds]);

  return {
    selectedSequence,
    setSelectedSequence,
    filteredTasks,
    filterConfig,
    setFilterConfig,
    filteredSequences,
  };
}
