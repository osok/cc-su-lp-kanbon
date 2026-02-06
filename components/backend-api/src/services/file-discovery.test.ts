/**
 * Unit tests for file-discovery service.
 * Test plan: TP-020 through TP-022
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { FileDiscoveryService } from './file-discovery.js';

describe('FileDiscoveryService', () => {
  let tempDir: string;
  let service: FileDiscoveryService;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'atkd-test-'));
    service = new FileDiscoveryService();
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  // TP-020: File discovery finds .md files
  it('should find .md files in directory', async () => {
    await fs.writeFile(path.join(tempDir, 'tasks.md'), '# Tasks');
    await fs.writeFile(path.join(tempDir, 'other.md'), '# Other');

    const files = await service.discoverFiles(tempDir);
    expect(files).toHaveLength(2);
    expect(files.map(f => f.filename).sort()).toEqual(['other.md', 'tasks.md']);
  });

  // TP-021: File discovery ignores non-md files
  it('should ignore non-md files', async () => {
    await fs.writeFile(path.join(tempDir, 'tasks.md'), '# Tasks');
    await fs.writeFile(path.join(tempDir, 'data.json'), '{}');
    await fs.writeFile(path.join(tempDir, 'notes.txt'), 'notes');

    const files = await service.discoverFiles(tempDir);
    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('tasks.md');
  });

  // TP-022: File discovery non-recursive
  it('should not scan subdirectories', async () => {
    await fs.writeFile(path.join(tempDir, 'tasks.md'), '# Tasks');
    const subDir = path.join(tempDir, 'subdir');
    await fs.mkdir(subDir);
    await fs.writeFile(path.join(subDir, 'nested.md'), '# Nested');

    const files = await service.discoverFiles(tempDir);
    expect(files).toHaveLength(1);
    expect(files[0].filename).toBe('tasks.md');
  });

  it('should return empty array for nonexistent directory', async () => {
    const files = await service.discoverFiles('/nonexistent/path');
    expect(files).toHaveLength(0);
  });

  it('should include mtime for each file', async () => {
    await fs.writeFile(path.join(tempDir, 'tasks.md'), '# Tasks');

    const files = await service.discoverFiles(tempDir);
    expect(files[0].mtime).toBeGreaterThan(0);
  });
});
