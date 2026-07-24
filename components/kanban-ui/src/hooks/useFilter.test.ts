/**
 * Hook tests for useFilter name filtering, sort direction, and
 * sequence identity by sourceFile (sequenceIds are not unique).
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Task, Sequence, StatusType } from '@kanban/types';
import { useFilter } from './useFilter.js';

function makeSequence(sequenceId: string, sequenceName: string, sourceFile?: string): Sequence {
  return {
    sequenceId,
    sequenceName,
    sourceFile: sourceFile ?? `${sequenceId}-${sequenceName}-tasks.md`,
    totalTasks: 1,
    completedTasks: 0,
    statusBreakdown: { 'complete': 0, 'in-progress': 0, 'pending': 1, 'blocked': 0, 'deferred': 0 },
    lastModified: '',
  };
}

function makeTask(
  taskId: string,
  taskName: string,
  sequenceId: string,
  sequenceName: string,
  sourceFile?: string,
): Task {
  return {
    taskId,
    taskName,
    status: 'pending' as StatusType,
    blockedBy: [],
    agent: 'developer',
    priority: 'high',
    sequenceId,
    sequenceName,
    sourceFile: sourceFile ?? `${sequenceId}-${sequenceName}-tasks.md`,
  };
}

const sequences = [
  makeSequence('000', 'EVA-001--short_name'),
  makeSequence('001', 'kanban-dashboard'),
  makeSequence('002', 'EVA-002--other_thing'),
];

const tasks = [
  makeTask('TASK-001', 'Setup project', '000', 'EVA-001--short_name'),
  makeTask('TASK-002', 'Build parser', '001', 'kanban-dashboard'),
  makeTask('TASK-003', 'Write docs', '002', 'EVA-002--other_thing'),
];

describe('useFilter name filtering', () => {
  it('should show only sequences whose name matches, case-insensitive', () => {
    const { result } = renderHook(() => useFilter(tasks, sequences));

    act(() => result.current.setNameFilter('eva'));

    expect(result.current.filteredSequences.map(s => s.sequenceId)).toEqual(['002', '000']);
    expect(result.current.filteredTasks.map(t => t.taskId)).toEqual(['TASK-003', 'TASK-001']);
  });

  it('should ignore glob asterisks in the filter text', () => {
    const { result } = renderHook(() => useFilter(tasks, sequences));

    act(() => result.current.setNameFilter('*EVA*'));

    expect(result.current.filteredSequences.map(s => s.sequenceId)).toEqual(['002', '000']);
  });

  it('should not match on task names inside a list', () => {
    const { result } = renderHook(() => useFilter(tasks, sequences));

    act(() => result.current.setNameFilter('parser'));

    expect(result.current.filteredSequences).toHaveLength(0);
    expect(result.current.filteredTasks).toHaveLength(0);
  });

  it('should match the displayed "id - name" label form', () => {
    const { result } = renderHook(() => useFilter(tasks, sequences));

    act(() => result.current.setNameFilter('000 - EVA'));

    expect(result.current.filteredSequences.map(s => s.sequenceId)).toEqual(['000']);
  });

  it('should ignore a tab selection hidden by the name filter instead of emptying the board', () => {
    const { result } = renderHook(() => useFilter(tasks, sequences));

    act(() => result.current.setSelectedSequence('001-kanban-dashboard-tasks.md'));
    expect(result.current.filteredTasks.map(t => t.taskId)).toEqual(['TASK-002']);

    act(() => result.current.setNameFilter('eva'));

    // Selection is hidden -> behaves like "All" over the matching lists
    expect(result.current.selectedSequence).toBeNull();
    expect(result.current.filteredTasks.map(t => t.taskId)).toEqual(['TASK-003', 'TASK-001']);

    // Clearing the filter reveals the selection again
    act(() => result.current.setNameFilter(''));
    expect(result.current.selectedSequence).toBe('001-kanban-dashboard-tasks.md');
    expect(result.current.filteredTasks.map(t => t.taskId)).toEqual(['TASK-002']);
  });

  it('should report visibleTaskCount for the All tab', () => {
    const { result } = renderHook(() => useFilter(tasks, sequences));

    expect(result.current.visibleTaskCount).toBe(3);

    act(() => result.current.setNameFilter('eva'));
    expect(result.current.visibleTaskCount).toBe(2);
  });

  it('should show everything when filter is cleared', () => {
    const { result } = renderHook(() => useFilter(tasks, sequences));

    act(() => result.current.setNameFilter('eva'));
    act(() => result.current.setNameFilter(''));

    expect(result.current.filteredSequences).toHaveLength(3);
    expect(result.current.filteredTasks).toHaveLength(3);
  });
});

describe('useFilter sort direction', () => {
  it('should default to descending (newest first)', () => {
    const { result } = renderHook(() => useFilter(tasks, sequences));

    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.filteredSequences.map(s => s.sequenceId)).toEqual(['002', '001', '000']);
    expect(result.current.filteredTasks.map(t => t.sequenceId)).toEqual(['002', '001', '000']);
  });

  it('should toggle to ascending and back', () => {
    const { result } = renderHook(() => useFilter(tasks, sequences));

    act(() => result.current.toggleSortDirection());

    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.filteredSequences.map(s => s.sequenceId)).toEqual(['000', '001', '002']);
    expect(result.current.filteredTasks.map(t => t.sequenceId)).toEqual(['000', '001', '002']);

    act(() => result.current.toggleSortDirection());

    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.filteredSequences.map(s => s.sequenceId)).toEqual(['002', '001', '000']);
  });

  it('should keep lastN meaning the NEWEST N in both directions', () => {
    const { result } = renderHook(() => useFilter(tasks, sequences));

    act(() => result.current.setFilterConfig({ mode: 'lastN', lastN: 2 }));

    // Desc: newest 2, newest first
    expect(result.current.filteredSequences.map(s => s.sequenceId)).toEqual(['002', '001']);

    act(() => result.current.toggleSortDirection());

    // Asc: SAME newest 2, oldest first — direction must not change the visible set
    expect(result.current.filteredSequences.map(s => s.sequenceId)).toEqual(['001', '002']);
  });
});

describe('useFilter with duplicate sequenceIds', () => {
  // Multiple files can share a sequenceId (e.g. all unprefixed files fall back to "000")
  const dupSequences = [
    makeSequence('000', 'EVA-003--stream', 'eva-003-tasks.md'),
    makeSequence('000', 'EVA-004--enum', 'eva-004-tasks.md'),
    makeSequence('271', 'EVA-001--numbering', '271-dev-a-tasks.md'),
    makeSequence('271', 'EVA-002--gates', '271-dev-b-tasks.md'),
  ];
  const dupTasks = [
    makeTask('TASK-001', 'Stream task', '000', 'EVA-003--stream', 'eva-003-tasks.md'),
    makeTask('TASK-001', 'Enum task', '000', 'EVA-004--enum', 'eva-004-tasks.md'),
    makeTask('TASK-001', 'Numbering task', '271', 'EVA-001--numbering', '271-dev-a-tasks.md'),
    makeTask('TASK-001', 'Gates task', '271', 'EVA-002--gates', '271-dev-b-tasks.md'),
  ];

  it('should keep every file as its own sequence with a stable order', () => {
    const { result } = renderHook(() => useFilter(dupTasks, dupSequences));

    expect(result.current.filteredSequences.map(s => s.sourceFile)).toEqual([
      '271-dev-b-tasks.md',
      '271-dev-a-tasks.md',
      'eva-004-tasks.md',
      'eva-003-tasks.md',
    ]);

    act(() => result.current.toggleSortDirection());
    act(() => result.current.toggleSortDirection());

    // Two toggles return to the exact same order — no drift
    expect(result.current.filteredSequences.map(s => s.sourceFile)).toEqual([
      '271-dev-b-tasks.md',
      '271-dev-a-tasks.md',
      'eva-004-tasks.md',
      'eva-003-tasks.md',
    ]);
  });

  it('should select a single file even when sequenceIds collide', () => {
    const { result } = renderHook(() => useFilter(dupTasks, dupSequences));

    act(() => result.current.setSelectedSequence('eva-004-tasks.md'));

    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].taskName).toBe('Enum task');
  });
});
