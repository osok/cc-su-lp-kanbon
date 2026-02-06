/**
 * Component tests for Header.
 * Test plan: TP-065, TP-073, TP-075, TP-078
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header.js';

const defaultProps = {
  lastUpdated: '2026-02-06T10:30:00Z',
  theme: 'light' as const,
  viewMode: 'flat' as const,
  showDependencies: false,
  onToggleTheme: vi.fn(),
  onToggleViewMode: vi.fn(),
  onToggleDependencies: vi.fn(),
  onOpenDirectoryPicker: vi.fn(),
};

describe('Header', () => {
  it('should render title', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('AI Tester Kanban Dashboard')).toBeInTheDocument();
  });

  // TP-078: LastUpdated displays time
  it('should display last updated time', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  // TP-065: ThemeToggle switches theme
  it('should call onToggleTheme when theme button clicked', () => {
    const onToggle = vi.fn();
    render(<Header {...defaultProps} onToggleTheme={onToggle} />);

    fireEvent.click(screen.getByText('Dark'));
    expect(onToggle).toHaveBeenCalled();
  });

  // TP-073: SwimlaneToggle switches view
  it('should call onToggleViewMode when swimlane button clicked', () => {
    const onToggle = vi.fn();
    render(<Header {...defaultProps} onToggleViewMode={onToggle} />);

    fireEvent.click(screen.getByText('Swimlane'));
    expect(onToggle).toHaveBeenCalled();
  });

  // TP-075: DependencyToggle shows/hides
  it('should call onToggleDependencies when dependency button clicked', () => {
    const onToggle = vi.fn();
    render(<Header {...defaultProps} onToggleDependencies={onToggle} />);

    fireEvent.click(screen.getByText('Dependencies'));
    expect(onToggle).toHaveBeenCalled();
  });

  it('should call onOpenDirectoryPicker when directory button clicked', () => {
    const onOpen = vi.fn();
    render(<Header {...defaultProps} onOpenDirectoryPicker={onOpen} />);

    fireEvent.click(screen.getByText('Directory'));
    expect(onOpen).toHaveBeenCalled();
  });
});
