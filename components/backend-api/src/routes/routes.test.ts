/**
 * Integration tests for API routes.
 * Test plan: TP-040 through TP-049
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createApp } from '../server.js';
import { PollManager } from '../services/poll-manager.js';
import { ConfigStore } from '../services/config-store.js';
import { FileDiscoveryService } from '../services/file-discovery.js';
import type { Express } from 'express';

describe('API Routes', () => {
  let app: Express;
  let tempDir: string;
  let configDir: string;
  let pollManager: PollManager;
  let configStore: ConfigStore;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'atkd-routes-'));
    configDir = await fs.mkdtemp(path.join(os.tmpdir(), 'atkd-config-'));
    const configPath = path.join(configDir, 'atkd.json');

    configStore = new ConfigStore(configPath);
    const fileDiscovery = new FileDiscoveryService();
    pollManager = new PollManager(null, 30000, fileDiscovery);

    app = createApp({ pollManager, configStore });
  });

  afterEach(async () => {
    pollManager.stop();
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.rm(configDir, { recursive: true, force: true });
  });

  // TP-042: GET /api/tasks 503 without directory
  it('GET /api/tasks should return 503 when no directory configured', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('NO_DIRECTORY');
  });

  // TP-041: GET /api/tasks envelope format
  it('GET /api/tasks should return proper envelope format', async () => {
    // Set up directory with a task file
    await fs.writeFile(
      path.join(tempDir, '001-tasks.md'),
      `| ID | Task | Status | Blocked-By | Agent | Notes |
|----|------|--------|------------|-------|-------|
| T001 | Test task | complete | - | Dev | |
`
    );

    pollManager.reset(tempDir);
    await pollManager.pollOnce();

    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('timestamp');
    expect(res.body.meta).toHaveProperty('pollCycle');
    expect(res.body.data).toHaveProperty('tasks');
    expect(res.body.data).toHaveProperty('changes');
  });

  // TP-040: GET /api/tasks returns tasks
  it('GET /api/tasks should return parsed tasks', async () => {
    await fs.writeFile(
      path.join(tempDir, '001-tasks.md'),
      `# Core Tasks

| ID | Task | Status | Blocked-By | Agent | Priority |
|----|------|--------|------------|-------|----------|
| TASK-001-001 | Setup | complete | - | Developer | high |
| TASK-001-002 | Build | pending | TASK-001-001 | Developer | medium |
`
    );

    pollManager.reset(tempDir);
    await pollManager.pollOnce();

    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.data.tasks).toHaveLength(2);
    expect(res.body.data.tasks[0].taskId).toBe('TASK-001-001');
  });

  // TP-043: GET /api/sequences returns sequences
  it('GET /api/sequences should return sequence metadata', async () => {
    await fs.writeFile(
      path.join(tempDir, '001-tasks.md'),
      `# Core Tasks

| ID | Task | Status | Blocked-By | Agent | Notes |
|----|------|--------|------------|-------|-------|
| T001 | Setup | complete | - | Dev | |
`
    );

    pollManager.reset(tempDir);
    await pollManager.pollOnce();

    const res = await request(app).get('/api/sequences');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toHaveProperty('sequenceId');
    expect(res.body.data[0]).toHaveProperty('totalTasks');
  });

  // TP-044: GET /api/status returns health
  it('GET /api/status should return system status', async () => {
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('isPolling');
    expect(res.body.data).toHaveProperty('fileCount');
    expect(res.body.data).toHaveProperty('errorCount');
  });

  // TP-045: POST /api/config/directory valid
  it('POST /api/config/directory should accept valid directory', async () => {
    const res = await request(app)
      .post('/api/config/directory')
      .send({ directory: tempDir });
    expect(res.status).toBe(200);
    expect(res.body.data.directory).toBe(tempDir);
  });

  // TP-046: POST /api/config/directory invalid
  it('POST /api/config/directory should reject nonexistent directory', async () => {
    const res = await request(app)
      .post('/api/config/directory')
      .send({ directory: '/nonexistent/path/to/dir' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PATH');
  });

  // TP-047: POST /api/config/directory traversal
  it('POST /api/config/directory should reject traversal paths', async () => {
    const res = await request(app)
      .post('/api/config/directory')
      .send({ directory: '/home/../etc/passwd' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PATH');
  });

  // TP-048: GET /api/config returns config
  it('GET /api/config should return current configuration', async () => {
    const res = await request(app).get('/api/config');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('directory');
    expect(res.body.data).toHaveProperty('pollingInterval');
  });

  // GET /api/config/browse lists subdirectories of a valid path
  it('GET /api/config/browse should list subdirectories of a valid path', async () => {
    await fs.mkdir(path.join(tempDir, 'sub-a'));
    await fs.mkdir(path.join(tempDir, 'sub-b'));

    const res = await request(app)
      .get('/api/config/browse')
      .query({ path: tempDir });

    expect(res.status).toBe(200);
    expect(res.body.data.current).toBe(tempDir);
    expect(res.body.data.directories.map((d: { name: string }) => d.name)).toEqual([
      'sub-a',
      'sub-b',
    ]);
  });

  // GET /api/config/browse falls back to home when the path does not exist
  it('GET /api/config/browse should fall back to home dir for a nonexistent path', async () => {
    const res = await request(app)
      .get('/api/config/browse')
      .query({ path: '/nonexistent/path/that/is/gone' });

    expect(res.status).toBe(200);
    expect(res.body.data.current).toBe(os.homedir());
  });

  // GET /api/config/browse defaults to home when no path is given
  it('GET /api/config/browse should default to home dir when no path given', async () => {
    const res = await request(app).get('/api/config/browse');
    expect(res.status).toBe(200);
    expect(res.body.data.current).toBe(os.homedir());
  });

  // GET /api/config/browse rejects traversal
  it('GET /api/config/browse should reject traversal paths', async () => {
    const res = await request(app)
      .get('/api/config/browse')
      .query({ path: '/home/../etc' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PATH');
  });
});
