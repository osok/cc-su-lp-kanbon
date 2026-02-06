/**
 * File discovery service.
 * Scans a directory for markdown task files.
 * Requirements: FR-DIR-004, FR-DIR-005, FR-DIR-006
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import type { FileInfo } from '@kanban/types';

export class FileDiscoveryService {
  /**
   * Discover all .md files in the given directory (non-recursive, FR-DIR-004).
   * Returns file info including path, filename, and modification time.
   */
  async discoverFiles(directory: string): Promise<FileInfo[]> {
    const files: FileInfo[] = [];

    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isFile()) continue;
        if (!entry.name.endsWith('.md')) continue;

        const fullPath = path.join(directory, entry.name);
        try {
          const stat = await fs.stat(fullPath);
          files.push({
            path: fullPath,
            filename: entry.name,
            mtime: stat.mtimeMs,
          });
        } catch {
          // Skip files that can't be stat'd (e.g., permissions issues)
        }
      }
    } catch {
      // Directory access error - return empty list
    }

    return files;
  }
}
