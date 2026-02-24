/**
 * TaskDetailModal component.
 * Displays extended task details in a modal overlay.
 * Requirements: Task detail view with Description, Resolution, and metadata.
 */
import React, { useEffect } from 'react';
import type { Task } from '@kanban/types';
import { getStatusColor } from '../../utils/colors.js';
import styles from './TaskDetailModal.module.css';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps): React.ReactElement | null {
  // Close on Escape key
  useEffect(() => {
    if (!task) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [task, onClose]);

  if (!task) return null;

  const detail = task.details;
  const statusColor = getStatusColor(task.status);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
      >
        {/* Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.taskId}>{task.taskId}</span>
            <h2 id="task-detail-title" className={styles.title}>{task.taskName}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {/* Status badge */}
        <span
          className={styles.statusBadge}
          style={{ backgroundColor: statusColor }}
        >
          {task.status}
        </span>

        {/* Metadata table */}
        <table className={styles.metaTable}>
          <tbody>
            <tr><td className={styles.fieldLabel}>Agent</td><td>{task.agent || '--'}</td></tr>
            {task.priority && (
              <tr><td className={styles.fieldLabel}>Priority</td><td>{task.priority}</td></tr>
            )}
            {task.blockedBy.length > 0 && (
              <tr><td className={styles.fieldLabel}>Blocked By</td><td>{task.blockedBy.join(', ')}</td></tr>
            )}
            <tr>
              <td className={styles.fieldLabel}>Sequence</td>
              <td>{task.sequenceId} - {task.sequenceName}</td>
            </tr>
            <tr><td className={styles.fieldLabel}>Source</td><td className={styles.mono}>{task.sourceFile}</td></tr>
          </tbody>
        </table>

        {/* Extended detail fields */}
        {detail && (
          <>
            {detail.requirements.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Requirements</h3>
                <div className={styles.tagList}>
                  {detail.requirements.map((req, i) => (
                    <span key={i} className={styles.tag}>{req}</span>
                  ))}
                </div>
              </div>
            )}

            {detail.designRef && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Design Ref</h3>
                <p className={styles.mono}>{detail.designRef}</p>
              </div>
            )}

            {detail.component && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Component</h3>
                <span className={styles.tag}>{detail.component}</span>
              </div>
            )}

            {detail.files.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Files</h3>
                <ul className={styles.fileList}>
                  {detail.files.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}

            {detail.acceptance && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Acceptance</h3>
                <p>{detail.acceptance}</p>
              </div>
            )}

            {detail.description && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Description</h3>
                <div className={styles.textBlock}>{detail.description}</div>
              </div>
            )}

            {detail.resolution && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Resolution</h3>
                <div className={styles.textBlock}>{detail.resolution}</div>
              </div>
            )}
          </>
        )}

        {/* No details fallback */}
        {!detail && (
          <p className={styles.noDetails}>
            No extended details available for this task.
          </p>
        )}
      </div>
    </div>
  );
}
