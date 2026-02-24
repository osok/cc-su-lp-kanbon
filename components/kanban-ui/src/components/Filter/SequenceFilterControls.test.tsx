/**
 * Component tests for SequenceFilterControls.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SequenceFilterControls } from './SequenceFilterControls.js';
import type { SequenceFilterConfig } from '../../hooks/useFilter.js';

const defaultConfig: SequenceFilterConfig = { mode: 'all', lastN: 5 };

const defaultProps = {
  filterConfig: defaultConfig,
  onFilterChange: vi.fn(),
  visibleCount: 10,
  totalCount: 10,
};

describe('SequenceFilterControls', () => {
  it('should render filter mode dropdown', () => {
    render(<SequenceFilterControls {...defaultProps} />);
    expect(screen.getByLabelText('Filter mode')).toBeInTheDocument();
  });

  it('should show lastN input when lastN mode selected', () => {
    render(
      <SequenceFilterControls {...defaultProps} filterConfig={{ mode: 'lastN', lastN: 3 }} />
    );
    expect(screen.getByLabelText('Number of recent task lists')).toBeInTheDocument();
  });

  it('should not show lastN input for other modes', () => {
    render(
      <SequenceFilterControls {...defaultProps} filterConfig={{ mode: 'hideComplete', lastN: 5 }} />
    );
    expect(screen.queryByLabelText('Number of recent task lists')).toBeNull();
  });

  it('should call onFilterChange when mode changes', () => {
    const onFilterChange = vi.fn();
    render(<SequenceFilterControls {...defaultProps} onFilterChange={onFilterChange} />);

    fireEvent.change(screen.getByLabelText('Filter mode'), { target: { value: 'hideComplete' } });
    expect(onFilterChange).toHaveBeenCalledWith({ mode: 'hideComplete', lastN: 5 });
  });

  it('should display count when all visible', () => {
    render(<SequenceFilterControls {...defaultProps} visibleCount={10} totalCount={10} />);
    expect(screen.getByText('10 lists')).toBeInTheDocument();
  });

  it('should display filtered count', () => {
    render(<SequenceFilterControls {...defaultProps} visibleCount={3} totalCount={10} />);
    expect(screen.getByText('3 of 10 lists')).toBeInTheDocument();
  });

  it('should display singular list', () => {
    render(<SequenceFilterControls {...defaultProps} visibleCount={1} totalCount={1} />);
    expect(screen.getByText('1 list')).toBeInTheDocument();
  });
});
