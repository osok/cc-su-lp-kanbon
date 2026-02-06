/**
 * usePolling hook.
 * Fetches tasks and sequences at a regular interval.
 * Requirements: FR-POL-002, FR-POL-003, FR-POL-004
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Task, Sequence, TaskChange } from '@kanban/types';
import { fetchTasks, fetchSequences } from '../api/client.js';

interface UsePollingResult {
  tasks: Task[];
  sequences: Sequence[];
  changes: TaskChange[];
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePolling(interval: number = 30000): UsePollingResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [changes, setChanges] = useState<TaskChange[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [tasksRes, seqRes] = await Promise.all([
        fetchTasks(),
        fetchSequences(),
      ]);

      setTasks(tasksRes.data.tasks);
      setChanges(tasksRes.data.changes);
      setSequences(seqRes.data);
      setLastUpdated(tasksRes.meta.timestamp);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    intervalRef.current = setInterval(refresh, interval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh, interval]);

  return { tasks, sequences, changes, lastUpdated, isLoading, error, refresh };
}
