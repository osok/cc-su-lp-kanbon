/**
 * Root application component.
 * Integrates all UI components into the full dashboard.
 * Requirements: IR-UI-003, FR-KBN-001, FR-THM-001
 */
import React, { useState, useCallback, useEffect } from 'react';
import type { AppConfig } from '@kanban/types';
import { Header } from './components/Header/Header.js';
import { ProgressHeatmap } from './components/Heatmap/ProgressHeatmap.js';
import { FilterBar } from './components/Filter/FilterBar.js';
import { Board } from './components/Board/Board.js';
import { SwimlaneBoard } from './components/Swimlane/SwimlaneBoard.js';
import { DependencyOverlay } from './components/DependencyOverlay/DependencyOverlay.js';
import { DirectoryPickerModal } from './components/DirectoryPicker/DirectoryPickerModal.js';
import { EmptyState } from './components/ErrorBoundary/EmptyState.js';
import { ErrorState } from './components/ErrorBoundary/ErrorState.js';
import { usePolling } from './hooks/usePolling.js';
import { useTheme } from './hooks/useTheme.js';
import { useFilter } from './hooks/useFilter.js';
import { fetchConfig } from './api/client.js';

export function App(): React.ReactElement {
  const { theme, toggleTheme } = useTheme();
  const { tasks, sequences, changes, lastUpdated, isLoading, error, refresh } = usePolling(30000);
  const { selectedSequence, setSelectedSequence, filteredTasks } = useFilter(tasks);

  const [viewMode, setViewMode] = useState<'flat' | 'swimlane'>('flat');
  const [showDependencies, setShowDependencies] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showDirectoryPicker, setShowDirectoryPicker] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);

  // Load initial config
  useEffect(() => {
    fetchConfig()
      .then(res => {
        setConfig(res.data);
        if (!res.data.directory) {
          setShowDirectoryPicker(true);
        }
      })
      .catch(() => {
        // If config fetch fails, show directory picker
        setShowDirectoryPicker(true);
      });
  }, []);

  const handleToggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'flat' ? 'swimlane' : 'flat');
  }, []);

  const handleToggleDependencies = useCallback(() => {
    setShowDependencies(prev => !prev);
  }, []);

  const handleSelectTask = useCallback((taskId: string) => {
    setSelectedTaskId(prev => prev === taskId ? null : taskId);
  }, []);

  const handleOpenDirectoryPicker = useCallback(() => {
    setShowDirectoryPicker(true);
  }, []);

  const handleDirectorySet = useCallback(() => {
    // Refresh data after directory change
    fetchConfig().then(res => setConfig(res.data)).catch(() => {});
    setTimeout(refresh, 1000);
  }, [refresh]);

  const handleSelectSequenceFromHeatmap = useCallback((sequenceId: string) => {
    setSelectedSequence(sequenceId);
  }, [setSelectedSequence]);

  // Loading state
  if (isLoading && tasks.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error && tasks.length === 0) {
    return (
      <>
        <Header
          lastUpdated={lastUpdated}
          theme={theme}
          viewMode={viewMode}
          showDependencies={showDependencies}
          onToggleTheme={toggleTheme}
          onToggleViewMode={handleToggleViewMode}
          onToggleDependencies={handleToggleDependencies}
          onOpenDirectoryPicker={handleOpenDirectoryPicker}
        />
        <ErrorState error={error} onChangeDirectory={handleOpenDirectoryPicker} />
        <DirectoryPickerModal
          isOpen={showDirectoryPicker}
          currentDirectory={config?.directory ?? null}
          onClose={() => setShowDirectoryPicker(false)}
          onDirectorySet={handleDirectorySet}
        />
      </>
    );
  }

  // Empty state
  if (!isLoading && tasks.length === 0 && config?.directory) {
    return (
      <>
        <Header
          lastUpdated={lastUpdated}
          theme={theme}
          viewMode={viewMode}
          showDependencies={showDependencies}
          onToggleTheme={toggleTheme}
          onToggleViewMode={handleToggleViewMode}
          onToggleDependencies={handleToggleDependencies}
          onOpenDirectoryPicker={handleOpenDirectoryPicker}
        />
        <EmptyState directory={config.directory} />
        <DirectoryPickerModal
          isOpen={showDirectoryPicker}
          currentDirectory={config.directory}
          onClose={() => setShowDirectoryPicker(false)}
          onDirectorySet={handleDirectorySet}
        />
      </>
    );
  }

  return (
    <>
      <Header
        lastUpdated={lastUpdated}
        theme={theme}
        viewMode={viewMode}
        showDependencies={showDependencies}
        onToggleTheme={toggleTheme}
        onToggleViewMode={handleToggleViewMode}
        onToggleDependencies={handleToggleDependencies}
        onOpenDirectoryPicker={handleOpenDirectoryPicker}
      />

      <ProgressHeatmap
        sequences={sequences}
        onSelectSequence={handleSelectSequenceFromHeatmap}
      />

      <FilterBar
        sequences={sequences}
        selectedSequence={selectedSequence}
        totalTasks={tasks.length}
        onSelectSequence={setSelectedSequence}
      />

      {viewMode === 'flat' ? (
        <Board
          tasks={filteredTasks}
          changes={changes}
          selectedTaskId={selectedTaskId}
          onSelectTask={handleSelectTask}
        />
      ) : (
        <SwimlaneBoard
          tasks={filteredTasks}
          changes={changes}
          selectedTaskId={selectedTaskId}
          onSelectTask={handleSelectTask}
        />
      )}

      <DependencyOverlay
        tasks={filteredTasks}
        selectedTaskId={selectedTaskId}
        visible={showDependencies}
      />

      <DirectoryPickerModal
        isOpen={showDirectoryPicker}
        currentDirectory={config?.directory ?? null}
        onClose={() => setShowDirectoryPicker(false)}
        onDirectorySet={handleDirectorySet}
      />
    </>
  );
}
