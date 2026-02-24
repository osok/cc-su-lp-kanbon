/**
 * Component tests for TaskDetailModal.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskDetailModal } from './TaskDetailModal.js';
import type { Task } from '@kanban/types';

const mockTask: Task = {
  taskId: 'TASK-001-005',
  taskName: 'Implement auth handler',
  status: 'in-progress',
  blockedBy: ['TASK-001-004'],
  agent: 'Developer',
  priority: 'High',
  sequenceId: '001',
  sequenceName: 'Core',
  sourceFile: '001-tasks.md',
  details: {
    requirements: ['REQ-001-FN-005', 'REQ-001-FN-007'],
    designRef: '001-design.md',
    component: 'backend-api',
    files: ['src/auth.ts', 'src/middleware/auth.ts'],
    acceptance: 'Auth middleware rejects invalid tokens',
    description: 'Implement JWT-based auth handler for all protected routes.',
    resolution: 'Completed using jsonwebtoken library.',
  },
};

const mockTaskNoDetails: Task = {
  taskId: 'T001',
  taskName: 'Simple task',
  status: 'pending',
  blockedBy: [],
  agent: 'Developer',
  priority: '',
  sequenceId: '001',
  sequenceName: 'Core',
  sourceFile: '001-tasks.md',
};

describe('TaskDetailModal', () => {
  it('should render nothing when task is null', () => {
    const { container } = render(<TaskDetailModal task={null} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('should render task ID and name', () => {
    render(<TaskDetailModal task={mockTask} onClose={vi.fn()} />);
    expect(screen.getByText('TASK-001-005')).toBeInTheDocument();
    expect(screen.getByText('Implement auth handler')).toBeInTheDocument();
  });

  it('should render status badge', () => {
    render(<TaskDetailModal task={mockTask} onClose={vi.fn()} />);
    expect(screen.getByText('in-progress')).toBeInTheDocument();
  });

  it('should render base metadata', () => {
    render(<TaskDetailModal task={mockTask} onClose={vi.fn()} />);
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('TASK-001-004')).toBeInTheDocument();
  });

  it('should render requirements as tags when details present', () => {
    render(<TaskDetailModal task={mockTask} onClose={vi.fn()} />);
    expect(screen.getByText('REQ-001-FN-005')).toBeInTheDocument();
    expect(screen.getByText('REQ-001-FN-007')).toBeInTheDocument();
  });

  it('should render design ref', () => {
    render(<TaskDetailModal task={mockTask} onClose={vi.fn()} />);
    expect(screen.getByText('001-design.md')).toBeInTheDocument();
  });

  it('should render component', () => {
    render(<TaskDetailModal task={mockTask} onClose={vi.fn()} />);
    expect(screen.getByText('backend-api')).toBeInTheDocument();
  });

  it('should render files list', () => {
    render(<TaskDetailModal task={mockTask} onClose={vi.fn()} />);
    expect(screen.getByText('src/auth.ts')).toBeInTheDocument();
    expect(screen.getByText('src/middleware/auth.ts')).toBeInTheDocument();
  });

  it('should render description and resolution text blocks', () => {
    render(<TaskDetailModal task={mockTask} onClose={vi.fn()} />);
    expect(screen.getByText('Implement JWT-based auth handler for all protected routes.')).toBeInTheDocument();
    expect(screen.getByText('Completed using jsonwebtoken library.')).toBeInTheDocument();
  });

  it('should show no-details message when details absent', () => {
    render(<TaskDetailModal task={mockTaskNoDetails} onClose={vi.fn()} />);
    expect(screen.getByText(/No extended details available/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<TaskDetailModal task={mockTask} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<TaskDetailModal task={mockTask} onClose={onClose} />);
    // Click the backdrop (parent of the dialog)
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog.parentElement!);
    expect(onClose).toHaveBeenCalled();
  });

  it('should not call onClose when modal content is clicked', () => {
    const onClose = vi.fn();
    render(<TaskDetailModal task={mockTask} onClose={onClose} />);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
