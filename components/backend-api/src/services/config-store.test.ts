/**
 * Unit tests for config-store service.
 * Test plan: TP-029, TP-030
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ConfigStore } from './config-store.js';

describe('ConfigStore', () => {
  let tempDir: string;
  let configPath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'atkd-config-'));
    configPath = path.join(tempDir, 'config', 'atkd.json');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // TP-029: Config store persists directory
  it('should save and load config', () => {
    const store = new ConfigStore(configPath);
    store.save({ directory: '/test/path', pollingInterval: 15000 });

    const loaded = store.load();
    expect(loaded.directory).toBe('/test/path');
    expect(loaded.pollingInterval).toBe(15000);
  });

  // TP-030: Config store handles missing file
  it('should return defaults when no config file exists', () => {
    const store = new ConfigStore(configPath);
    const config = store.load();

    expect(config.directory).toBeNull();
    expect(config.pollingInterval).toBe(30000);
  });

  it('should create config directory if it does not exist', () => {
    const store = new ConfigStore(configPath);
    store.save({ directory: '/test', pollingInterval: 30000 });

    expect(fs.existsSync(configPath)).toBe(true);
  });
});
