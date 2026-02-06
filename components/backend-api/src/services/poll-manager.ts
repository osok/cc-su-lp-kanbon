/**
 * Poll manager service.
 * Polls the filesystem at a configurable interval, re-parses changed files,
 * maintains an in-memory snapshot of parsed data.
 * Requirements: FR-POL-001, FR-POL-005, NR-REL-001
 */
import fs from 'node:fs/promises';
import type {
  Task,
  Sequence,
  SystemStatus,
  TaskChange,
  ParseResult,
  StatusType,
} from '@kanban/types';
import { parseTaskFile } from '@kanban/md-parser';
import type { FileDiscoveryService } from './file-discovery.js';

export class PollManager {
  private taskStore: Map<string, ParseResult> = new Map();
  private mtimeCache: Map<string, number> = new Map();
  private _pollCycle: number = 0;
  private _lastPollTime: string | null = null;
  private _errors: string[] = [];
  private _changes: TaskChange[] = [];
  private _isPolling: boolean = false;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private _directory: string | null;
  private _interval: number;
  private fileDiscovery: FileDiscoveryService;

  constructor(
    directory: string | null,
    interval: number = 30000,
    fileDiscovery: FileDiscoveryService,
  ) {
    this._directory = directory;
    this._interval = interval;
    this.fileDiscovery = fileDiscovery;
  }

  get directory(): string | null {
    return this._directory;
  }

  get pollCycle(): number {
    return this._pollCycle;
  }

  /** Start the polling loop. */
  start(): void {
    if (this._isPolling) return;
    if (!this._directory) return;

    this._isPolling = true;
    // Run immediately, then at interval
    this.pollOnce().catch(() => {});
    this.intervalHandle = setInterval(() => {
      this.pollOnce().catch(() => {});
    }, this._interval);
  }

  /** Stop the polling loop. */
  stop(): void {
    this._isPolling = false;
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  /** Reset with a new directory. Clears all state and restarts. */
  reset(directory: string, interval?: number): void {
    this.stop();
    this._directory = directory;
    if (interval !== undefined) this._interval = interval;
    this.taskStore.clear();
    this.mtimeCache.clear();
    this._pollCycle = 0;
    this._lastPollTime = null;
    this._errors = [];
    this._changes = [];
    this.start();
  }

  /** Execute a single poll cycle. */
  async pollOnce(): Promise<void> {
    if (!this._directory) return;

    const errors: string[] = [];
    const previousTasks = new Map<string, Task>();

    // Snapshot previous state for change detection
    for (const result of this.taskStore.values()) {
      for (const task of result.tasks) {
        previousTasks.set(`${task.sequenceId}:${task.taskId}`, task);
      }
    }

    try {
      const files = await this.fileDiscovery.discoverFiles(this._directory);
      const currentFilenames = new Set(files.map(f => f.filename));

      // Remove entries for deleted files
      for (const filename of this.taskStore.keys()) {
        if (!currentFilenames.has(filename)) {
          this.taskStore.delete(filename);
          this.mtimeCache.delete(filename);
        }
      }

      // Process each file
      for (const file of files) {
        const cachedMtime = this.mtimeCache.get(file.filename);

        // Skip unchanged files (FR-POL-005)
        if (cachedMtime !== undefined && cachedMtime === file.mtime) {
          continue;
        }

        try {
          const content = await fs.readFile(file.path, 'utf-8');
          const result = parseTaskFile(content, file.filename);

          // Update the file's last modified time in the sequence
          result.sequence.lastModified = new Date(file.mtime).toISOString();

          this.taskStore.set(file.filename, result);
          this.mtimeCache.set(file.filename, file.mtime);

          if (result.warnings.length > 0) {
            errors.push(...result.warnings.map(w => `${file.filename}: ${w}`));
          }
        } catch (err: unknown) {
          const error = err as NodeJS.ErrnoException;
          if (error.code === 'EBUSY') {
            // File locked - skip and retry next cycle (NR-REL-001)
            errors.push(`${file.filename}: file locked, will retry next cycle`);
          } else {
            errors.push(`${file.filename}: ${error.message || 'read error'}`);
          }
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      errors.push(`Directory error: ${error.message}`);
    }

    // Detect changes (FR-POL-004)
    const changes: TaskChange[] = [];
    const now = new Date().toISOString();
    for (const result of this.taskStore.values()) {
      for (const task of result.tasks) {
        const key = `${task.sequenceId}:${task.taskId}`;
        const prev = previousTasks.get(key);
        if (prev && prev.status !== task.status) {
          changes.push({
            taskId: task.taskId,
            previousStatus: prev.status,
            newStatus: task.status,
            changedAt: now,
          });
        }
      }
    }

    this._changes = changes;
    this._errors = errors;
    this._pollCycle++;
    this._lastPollTime = now;
  }

  /** Get all tasks from all parsed files. */
  getAllTasks(): Task[] {
    const tasks: Task[] = [];
    for (const result of this.taskStore.values()) {
      tasks.push(...result.tasks);
    }
    return tasks;
  }

  /** Get sequence metadata for all parsed files. */
  getSequences(): Sequence[] {
    const sequences: Sequence[] = [];
    for (const result of this.taskStore.values()) {
      if (result.tasks.length > 0) {
        sequences.push(result.sequence);
      }
    }
    return sequences;
  }

  /** Get system status. */
  getStatus(): SystemStatus {
    return {
      lastPollTime: this._lastPollTime,
      fileCount: this.taskStore.size,
      errorCount: this._errors.length,
      errors: this._errors,
      isPolling: this._isPolling,
    };
  }

  /** Get tasks that changed in the last poll. */
  getChanges(): TaskChange[] {
    return this._changes;
  }
}
