/**
 * DependencyOverlay component.
 * SVG overlay that draws dependency lines between task cards.
 * Requirements: FR-DEP-003, FR-DEP-004, FR-DEP-005, ADR-004
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Task } from '@kanban/types';
import { getSequenceColor } from '../../utils/colors.js';
import styles from './DependencyOverlay.module.css';

interface DependencyOverlayProps {
  tasks: Task[];
  selectedTaskId: string | null;
  visible: boolean;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  dashed: boolean;
}

export function DependencyOverlay({ tasks, selectedTaskId, visible }: DependencyOverlayProps): React.ReactElement | null {
  const svgRef = useRef<SVGSVGElement>(null);
  const [lines, setLines] = useState<Line[]>([]);

  const calculateLines = useCallback(() => {
    if (!selectedTaskId || !visible) {
      setLines([]);
      return;
    }

    const selectedTask = tasks.find(t => t.taskId === selectedTaskId);
    if (!selectedTask) {
      setLines([]);
      return;
    }

    const newLines: Line[] = [];
    const selectedEl = document.querySelector(`[data-task-id="${selectedTaskId}"]`);
    if (!selectedEl) {
      setLines([]);
      return;
    }

    const selectedRect = selectedEl.getBoundingClientRect();
    const color = getSequenceColor(selectedTask.sequenceId);

    // Blocker lines: solid, arrow pointing to blocker
    for (const blockerId of selectedTask.blockedBy) {
      const blockerEl = document.querySelector(`[data-task-id="${blockerId}"]`);
      if (!blockerEl) continue;
      const blockerRect = blockerEl.getBoundingClientRect();

      newLines.push({
        x1: selectedRect.left + selectedRect.width / 2,
        y1: selectedRect.top + selectedRect.height / 2,
        x2: blockerRect.left + blockerRect.width / 2,
        y2: blockerRect.top + blockerRect.height / 2,
        color,
        dashed: false,
      });
    }

    // Dependent lines: dashed, arrow from selected to dependent
    for (const task of tasks) {
      if (task.blockedBy.includes(selectedTaskId)) {
        const depEl = document.querySelector(`[data-task-id="${task.taskId}"]`);
        if (!depEl) continue;
        const depRect = depEl.getBoundingClientRect();

        newLines.push({
          x1: selectedRect.left + selectedRect.width / 2,
          y1: selectedRect.top + selectedRect.height / 2,
          x2: depRect.left + depRect.width / 2,
          y2: depRect.top + depRect.height / 2,
          color,
          dashed: true,
        });
      }
    }

    setLines(newLines);
  }, [selectedTaskId, tasks, visible]);

  useEffect(() => {
    calculateLines();

    // Recalculate on scroll and resize
    window.addEventListener('scroll', calculateLines, true);
    window.addEventListener('resize', calculateLines);
    return () => {
      window.removeEventListener('scroll', calculateLines, true);
      window.removeEventListener('resize', calculateLines);
    };
  }, [calculateLines]);

  if (!visible || lines.length === 0) return null;

  return (
    <svg
      ref={svgRef}
      className={styles.overlay}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="currentColor" />
        </marker>
      </defs>
      {lines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={line.color}
          strokeWidth={2}
          strokeDasharray={line.dashed ? '6 4' : 'none'}
          opacity={0.7}
          markerEnd="url(#arrowhead)"
          style={{ color: line.color }}
        />
      ))}
    </svg>
  );
}
