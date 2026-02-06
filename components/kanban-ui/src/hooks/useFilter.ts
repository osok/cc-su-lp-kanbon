/**
 * useFilter hook.
 * Manages sequence filter state with persistence across polls.
 * Requirements: FR-FLT-003, FR-FLT-004
 */
import { useState, useMemo, useCallback } from 'react';
import type { Task } from '@kanban/types';

interface UseFilterResult {
  selectedSequence: string | null;
  setSelectedSequence: (sequenceId: string | null) => void;
  filteredTasks: Task[];
}

export function useFilter(tasks: Task[]): UseFilterResult {
  const [selectedSequence, setSelectedSequenceState] = useState<string | null>(null);

  const setSelectedSequence = useCallback((sequenceId: string | null) => {
    setSelectedSequenceState(sequenceId);
  }, []);

  const filteredTasks = useMemo(() => {
    if (!selectedSequence) return tasks;
    return tasks.filter(task => task.sequenceId === selectedSequence);
  }, [tasks, selectedSequence]);

  return { selectedSequence, setSelectedSequence, filteredTasks };
}
