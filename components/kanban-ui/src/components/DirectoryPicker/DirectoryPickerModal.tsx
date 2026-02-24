/**
 * DirectoryPickerModal component.
 * Modal for browsing and selecting a directory on the server filesystem.
 * Requirements: FR-DIR-001, FR-DIR-003
 */
import React, { useState, useCallback, useEffect } from 'react';
import { setDirectory, browseDirectory } from '../../api/client.js';
import type { BrowseEntry } from '../../api/client.js';
import styles from './DirectoryPickerModal.module.css';

interface DirectoryPickerModalProps {
  isOpen: boolean;
  currentDirectory: string | null;
  onClose: () => void;
  onDirectorySet: () => void;
}

export function DirectoryPickerModal({
  isOpen,
  currentDirectory,
  onClose,
  onDirectorySet,
}: DirectoryPickerModalProps): React.ReactElement | null {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [directories, setDirectories] = useState<BrowseEntry[]>([]);
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDirectory = useCallback(async (dirPath?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await browseDirectory(dirPath);
      setCurrentPath(res.data.current);
      setParentPath(res.data.parent);
      setDirectories(res.data.directories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to browse directory.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial directory when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDirectory(currentDirectory || undefined);
    }
  }, [isOpen, currentDirectory, loadDirectory]);

  const handleNavigate = useCallback((dirPath: string) => {
    loadDirectory(dirPath);
  }, [loadDirectory]);

  const handleGoUp = useCallback(() => {
    if (parentPath) {
      loadDirectory(parentPath);
    }
  }, [parentPath, loadDirectory]);

  const handleSelect = useCallback(async () => {
    if (!currentPath) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await setDirectory(currentPath);
      onDirectorySet();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set directory.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentPath, onDirectorySet, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dir-picker-title"
      >
        <h2 id="dir-picker-title" className={styles.title}>
          Select Task File Directory
        </h2>

        <div className={styles.pathBar}>
          <span className={styles.pathLabel}>Path:</span>
          <span className={styles.pathValue}>{currentPath}</span>
        </div>

        <div className={styles.browser}>
          {parentPath && (
            <button
              className={styles.dirEntry}
              onClick={handleGoUp}
              disabled={isLoading}
            >
              <span className={styles.dirIcon}>..</span>
              <span className={styles.dirName}>(parent directory)</span>
            </button>
          )}

          {isLoading && directories.length === 0 && (
            <div className={styles.loadingMsg}>Loading...</div>
          )}

          {!isLoading && directories.length === 0 && (
            <div className={styles.emptyMsg}>No subdirectories</div>
          )}

          {directories.map(dir => (
            <button
              key={dir.path}
              className={styles.dirEntry}
              onClick={() => handleNavigate(dir.path)}
              disabled={isLoading}
            >
              <span className={styles.dirIcon}>&#128193;</span>
              <span className={styles.dirName}>{dir.name}</span>
            </button>
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className={styles.selectBtn} onClick={handleSelect} disabled={isSubmitting || isLoading}>
            {isSubmitting ? 'Setting...' : 'Select This Directory'}
          </button>
        </div>
      </div>
    </div>
  );
}
