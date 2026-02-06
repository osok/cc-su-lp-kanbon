/**
 * DirectoryPickerModal component.
 * Modal for selecting the watched directory path.
 * Requirements: FR-DIR-001, FR-DIR-003
 */
import React, { useState, useCallback } from 'react';
import { setDirectory } from '../../api/client.js';
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
  const [path, setPath] = useState(currentDirectory || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!path.trim()) {
      setError('Please enter a directory path.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await setDirectory(path.trim());
      onDirectorySet();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set directory.');
    } finally {
      setIsSubmitting(false);
    }
  }, [path, onDirectorySet, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  }, [handleSubmit, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dir-picker-title"
      >
        <h2 id="dir-picker-title" className={styles.title}>
          Select Task File Directory
        </h2>

        <input
          type="text"
          className={styles.input}
          value={path}
          onChange={e => setPath(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="/path/to/task/files"
          autoFocus
          aria-label="Directory path"
        />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className={styles.selectBtn} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Setting...' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
}
