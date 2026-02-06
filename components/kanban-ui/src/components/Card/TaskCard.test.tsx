/**
 * Component tests for TaskCard.
 * Test plan: TP-060, TP-061, TP-064
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard.js';
import type { Task, TaskChange } from '@kanban/types';

const mockTask: Task = {
  taskId: 'TASK-003-015',
  taskName: 'Implement authentication handler',
  status: 'in-progress',
  blockedBy: ['TASK-003-014'],
  agent: 'Developer',
  priority: 'High',
  sequenceId: '003',
  sequenceName: 'ProjectManagerAgent',
  sourceFile: '003-project-manager-tasks.md',
};

describe('TaskCard', () => {
  // TP-060: TaskCard renders all fields
  it('should render task ID, name, agent, and priority', () => {
    render(
      <TaskCard
        task={mockTask}
        changes={[]}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText('TASK-003-015')).toBeInTheDocument();
    expect(screen.getByText('Implement authentication handler')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  // TP-061: TaskCard sequence color border
  it('should have data-task-id attribute', () => {
    const { container } = render(
      <TaskCard
        task={mockTask}
        changes={[]}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );

    const card = container.querySelector('[data-task-id="TASK-003-015"]');
    expect(card).not.toBeNull();
  });

  // TP-064: Board is read-only (no drag)
  it('should not have drag event handlers', () => {
    const { container } = render(
      <TaskCard
        task={mockTask}
        changes={[]}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );

    const card = container.querySelector('[data-task-id="TASK-003-015"]');
    expect(card?.getAttribute('draggable')).toBeNull();
  });

  it('should call onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        changes={[]}
        isSelected={false}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('TASK-003-015');
  });

  it('should apply changed class when task is in changes', () => {
    const changes: TaskChange[] = [{
      taskId: 'TASK-003-015',
      previousStatus: 'pending',
      newStatus: 'in-progress',
      changedAt: new Date().toISOString(),
    }];

    const { container } = render(
      <TaskCard
        task={mockTask}
        changes={changes}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );

    const card = container.querySelector('.card-changed');
    expect(card).not.toBeNull();
  });
});
