/**
 * Shared type definitions for the Kanban Dashboard.
 * Source of truth: design-docs/02-data-architecture.md
 */

/** Canonical status values */
export type StatusType = 'complete' | 'in-progress' | 'pending' | 'blocked' | 'deferred';

/** Single task record (Section 11.1.1) */
export interface Task {
  taskId: string;
  taskName: string;
  status: StatusType;
  blockedBy: string[];
  agent: string;
  priority: string;
  sequenceId: string;
  sequenceName: string;
  sourceFile: string;
}

/** Sequence metadata (Section 11.1.2) */
export interface Sequence {
  sequenceId: string;
  sequenceName: string;
  sourceFile: string;
  totalTasks: number;
  completedTasks: number;
  statusBreakdown: Record<StatusType, number>;
  lastModified: string;
}

/** Parser output for a single file */
export interface ParseResult {
  tasks: Task[];
  sequence: Sequence;
  warnings: string[];
}

/** API response envelope (IR-API-006) */
export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    pollCycle: number;
  };
}

/** API error response */
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
  meta: {
    timestamp: string;
    pollCycle: number;
  };
}

/** Application configuration */
export interface AppConfig {
  directory: string | null;
  pollingInterval: number;
}

/** System status */
export interface SystemStatus {
  lastPollTime: string | null;
  fileCount: number;
  errorCount: number;
  errors: string[];
  isPolling: boolean;
}

/** Change detection for UI highlighting */
export interface TaskChange {
  taskId: string;
  previousStatus: StatusType;
  newStatus: StatusType;
  changedAt: string;
}

/** File info from discovery */
export interface FileInfo {
  path: string;
  filename: string;
  mtime: number;
}

/** Tasks API response data */
export interface TasksResponseData {
  tasks: Task[];
  changes: TaskChange[];
}
