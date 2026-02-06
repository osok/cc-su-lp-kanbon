/**
 * Component tests for Board.
 * Test plan: TP-063, TP-064
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Board } from './Board.js';
import type { Task } from '@kanban/types';

const mockTasks: Task[] = [
  {
    taskId: 'T001', taskName: 'Pending task', status: 'pending',
    blockedBy: [], agent: 'Dev', priority: '', sequenceId: '001',
    sequenceName: 'Core', sourceFile: 'test.md',
  },
  {
    taskId: 'T002', taskName: 'In progress task', status: 'in-progress',
    blockedBy: ['T001'], agent: 'Dev', priority: '', sequenceId: '001',
    sequenceName: 'Core', sourceFile: 'test.md',
  },
  {
    taskId: 'T003', taskName: 'Blocked task', status: 'blocked',
    blockedBy: ['T002'], agent: 'Dev', priority: '', sequenceId: '001',
    sequenceName: 'Core', sourceFile: 'test.md',
  },
  {
    taskId: 'T004', taskName: 'Complete task', status: 'complete',
    blockedBy: [], agent: 'Dev', priority: '', sequenceId: '001',
    sequenceName: 'Core', sourceFile: 'test.md',
  },
  {
    taskId: 'T005', taskName: 'Deferred task', status: 'deferred',
    blockedBy: [], agent: 'Dev', priority: '', sequenceId: '001',
    sequenceName: 'Core', sourceFile: 'test.md',
  },
];

describe('Board', () => {
  // TP-063: Board renders 5 status columns
  it('should render all 5 status columns', () => {
    render(
      <Board
        tasks={mockTasks}
        changes={[]}
        selectedTaskId={null}
        onSelectTask={vi.fn()}
      />
    );

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
    expect(screen.getByText('Deferred')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('should distribute tasks to correct columns', () => {
    render(
      <Board
        tasks={mockTasks}
        changes={[]}
        selectedTaskId={null}
        onSelectTask={vi.fn()}
      />
    );

    // Each column should show 1 task
    const countBadges = screen.getAllByText('1');
    expect(countBadges).toHaveLength(5);
  });
});
