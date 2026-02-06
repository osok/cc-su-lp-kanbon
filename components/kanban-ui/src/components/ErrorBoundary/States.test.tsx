/**
 * Component tests for EmptyState and ErrorState.
 * Test plan: TP-076, TP-077
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './EmptyState.js';
import { ErrorState } from './ErrorState.js';

describe('EmptyState', () => {
  // TP-076: EmptyState shown when no tasks
  it('should show empty message with directory', () => {
    render(<EmptyState directory="/home/user/tasks" />);

    expect(screen.getByText('No task files found')).toBeInTheDocument();
    expect(screen.getByText('in: /home/user/tasks')).toBeInTheDocument();
    expect(screen.getByText(/Make sure the directory contains/)).toBeInTheDocument();
  });

  it('should handle null directory', () => {
    render(<EmptyState directory={null} />);
    expect(screen.getByText('No task files found')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  // TP-077: ErrorState shown on error
  it('should show error message and change directory button', () => {
    const onChangeDir = vi.fn();
    render(<ErrorState error="Cannot access directory" onChangeDirectory={onChangeDir} />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Cannot access directory')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Change Directory'));
    expect(onChangeDir).toHaveBeenCalled();
  });
});
