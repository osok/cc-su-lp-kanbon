/**
 * Component tests for FilterBar.
 * Test plan: TP-067, TP-068
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from './FilterBar.js';
import type { Sequence, StatusType } from '@kanban/types';

const emptyBreakdown: Record<StatusType, number> = {
  'complete': 0, 'in-progress': 0, 'pending': 0, 'blocked': 0, 'deferred': 0,
};

const mockSequences: Sequence[] = [
  {
    sequenceId: '001', sequenceName: 'Core', sourceFile: '001-tasks.md',
    totalTasks: 57, completedTasks: 52, statusBreakdown: { ...emptyBreakdown, complete: 52, pending: 5 },
    lastModified: '2026-01-01T00:00:00Z',
  },
  {
    sequenceId: '003', sequenceName: 'ProjMgr', sourceFile: '003-tasks.md',
    totalTasks: 50, completedTasks: 40, statusBreakdown: { ...emptyBreakdown, complete: 40, pending: 10 },
    lastModified: '2026-01-01T00:00:00Z',
  },
];

describe('FilterBar', () => {
  // TP-067: FilterBar renders sequence tabs
  it('should render tabs for all sequences', () => {
    render(
      <FilterBar
        sequences={mockSequences}
        selectedSequence={null}
        totalTasks={107}
        onSelectSequence={vi.fn()}
      />
    );

    expect(screen.getByText(/001 - Core/)).toBeInTheDocument();
    expect(screen.getByText(/003 - ProjMgr/)).toBeInTheDocument();
  });

  // TP-068: FilterBar "All" tab
  it('should render All tab with total count', () => {
    render(
      <FilterBar
        sequences={mockSequences}
        selectedSequence={null}
        totalTasks={107}
        onSelectSequence={vi.fn()}
      />
    );

    expect(screen.getByText('All (107)')).toBeInTheDocument();
  });

  it('should call onSelectSequence when tab is clicked', () => {
    const onSelect = vi.fn();
    render(
      <FilterBar
        sequences={mockSequences}
        selectedSequence={null}
        totalTasks={107}
        onSelectSequence={onSelect}
      />
    );

    fireEvent.click(screen.getByText(/001 - Core/));
    expect(onSelect).toHaveBeenCalledWith('001');
  });

  it('should call onSelectSequence with null when All is clicked', () => {
    const onSelect = vi.fn();
    render(
      <FilterBar
        sequences={mockSequences}
        selectedSequence="001"
        totalTasks={107}
        onSelectSequence={onSelect}
      />
    );

    fireEvent.click(screen.getByText('All (107)'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
