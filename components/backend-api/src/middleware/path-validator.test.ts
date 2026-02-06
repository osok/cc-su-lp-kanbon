/**
 * Unit tests for path-validator middleware.
 * Test plan: TP-031 through TP-033
 */
import { describe, it, expect } from 'vitest';
import os from 'node:os';
import { validateDirectoryPath } from './path-validator.js';

describe('validateDirectoryPath', () => {
  // TP-031: Path validator rejects traversal
  it('should reject paths with traversal sequences', () => {
    expect(validateDirectoryPath('/home/user/../etc/passwd')).toBeNull();
    expect(validateDirectoryPath('../../etc')).toBeNull();
  });

  // TP-032: Path validator rejects non-directory
  it('should reject non-directory paths', () => {
    expect(validateDirectoryPath('/nonexistent/path')).toBeNull();
  });

  // TP-033: Path validator accepts valid path
  it('should accept valid directory paths', () => {
    const result = validateDirectoryPath(os.tmpdir());
    expect(result).not.toBeNull();
    expect(typeof result).toBe('string');
  });

  it('should reject empty input', () => {
    expect(validateDirectoryPath('')).toBeNull();
  });

  it('should reject null-like input', () => {
    expect(validateDirectoryPath(null as unknown as string)).toBeNull();
  });
});
