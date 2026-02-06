/**
 * Component tests for ProgressHeatmap.
 * Test plan: TP-070, TP-071, TP-072
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressHeatmap } from './ProgressHeatmap.js';
import type { Sequence, StatusType } from '@kanban/types';

const emptyBreakdown: Record<StatusType, number> = {
  'complete': 0, 'in-progress': 0, 'pending': 0, 'blocked': 0, 'deferred': 0,
};

const mockSequences: Sequence[] = [
  {
    sequenceId: '001', sequenceName: 'Core', sourceFile: '001-tasks.md',
    totalTasks: 57, completedTasks: 52, statusBreakdown: { ...emptyBreakdown, complete: 52, 'in-progress': 2, pending: 3 },
    lastModified: '2026-01-01T00:00:00Z',
  },
];

describe('ProgressHeatmap', () => {
  // TP-070: HeatmapBar renders progress
  it('should render bars per sequence', () => {
    render(
      <ProgressHeatmap sequences={mockSequences} onSelectSequence={vi.fn()} />
    );
    expect(screen.getByText(/001 - Core/)).toBeInTheDocument();
  });

  // TP-072: HeatmapBar shows ratio
  it('should show completion ratio', () => {
    render(
      <ProgressHeatmap sequences={mockSequences} onSelectSequence={vi.fn()} />
    );
    expect(screen.getByText('52/57')).toBeInTheDocument();
    expect(screen.getByText('91%')).toBeInTheDocument();
  });

  it('should call onSelectSequence when clicked', () => {
    const onSelect = vi.fn();
    render(
      <ProgressHeatmap sequences={mockSequences} onSelectSequence={onSelect} />
    );

    fireEvent.click(screen.getByText(/001 - Core/));
    expect(onSelect).toHaveBeenCalledWith('001');
  });

  it('should render nothing when no sequences', () => {
    const { container } = render(
      <ProgressHeatmap sequences={[]} onSelectSequence={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });
});
