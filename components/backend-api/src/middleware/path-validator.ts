/**
 * Path validation middleware.
 * Sanitizes directory paths to prevent traversal attacks.
 * Requirements: NR-SEC-003
 */
import path from 'node:path';
import fs from 'node:fs';

/**
 * Validate a directory path from user input.
 * Returns the resolved absolute path if valid, or null if invalid.
 */
export function validateDirectoryPath(inputPath: string): string | null {
  if (!inputPath || typeof inputPath !== 'string') {
    return null;
  }

  // Reject paths containing traversal sequences
  if (inputPath.includes('..')) {
    return null;
  }

  // Resolve to absolute path
  const resolved = path.resolve(inputPath);

  // Verify directory exists and is readable
  try {
    const stat = fs.statSync(resolved);
    if (!stat.isDirectory()) return null;
    fs.accessSync(resolved, fs.constants.R_OK);
    return resolved;
  } catch {
    return null;
  }
}
