/**
 * Config API routes.
 * GET /api/config - Returns current configuration.
 * POST /api/config/directory - Set or change the watched directory.
 * GET /api/config/browse - Browse directories on the server filesystem.
 * Requirements: IR-API-004, IR-API-005, IR-API-006, NR-SEC-003
 */
import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { PollManager } from '../services/poll-manager.js';
import type { ConfigStore } from '../services/config-store.js';
import { validateDirectoryPath } from '../middleware/path-validator.js';

export const configRouter = Router();

/** GET /api/config - Returns current configuration */
configRouter.get('/', (req, res) => {
  const configStore = req.app.locals.configStore as ConfigStore;
  const pollManager = req.app.locals.pollManager as PollManager;
  const config = configStore.load();

  res.json({
    data: config,
    meta: {
      timestamp: new Date().toISOString(),
      pollCycle: pollManager.pollCycle,
    },
  });
});

/** POST /api/config/directory - Set or change the watched directory */
configRouter.post('/directory', (req, res) => {
  const configStore = req.app.locals.configStore as ConfigStore;
  const pollManager = req.app.locals.pollManager as PollManager;

  const { directory } = req.body as { directory?: string };

  if (!directory) {
    res.status(400).json({
      error: {
        code: 'INVALID_PATH',
        message: 'directory field is required.',
      },
      meta: {
        timestamp: new Date().toISOString(),
        pollCycle: pollManager.pollCycle,
      },
    });
    return;
  }

  const validatedPath = validateDirectoryPath(directory);
  if (!validatedPath) {
    res.status(400).json({
      error: {
        code: 'INVALID_PATH',
        message: 'Path does not exist or is not a readable directory.',
      },
      meta: {
        timestamp: new Date().toISOString(),
        pollCycle: pollManager.pollCycle,
      },
    });
    return;
  }

  // Save config and reset poll manager
  const config = configStore.load();
  config.directory = validatedPath;
  configStore.save(config);

  pollManager.reset(validatedPath, config.pollingInterval);

  res.json({
    data: config,
    meta: {
      timestamp: new Date().toISOString(),
      pollCycle: pollManager.pollCycle,
    },
  });
});

/** GET /api/config/browse - Browse directories on the server filesystem */
configRouter.get('/browse', (req, res) => {
  const requestedPath = (req.query.path as string) || os.homedir();

  // Reject path traversal
  if (requestedPath.includes('..')) {
    res.status(400).json({
      error: { code: 'INVALID_PATH', message: 'Path traversal not allowed.' },
    });
    return;
  }

  const resolved = path.resolve(requestedPath);

  try {
    const stat = fs.statSync(resolved);
    if (!stat.isDirectory()) {
      res.status(400).json({
        error: { code: 'INVALID_PATH', message: 'Path is not a directory.' },
      });
      return;
    }

    const entries = fs.readdirSync(resolved, { withFileTypes: true });
    const directories = entries
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(e => ({
        name: e.name,
        path: path.join(resolved, e.name),
      }));

    res.json({
      data: {
        current: resolved,
        parent: path.dirname(resolved) !== resolved ? path.dirname(resolved) : null,
        directories,
      },
    });
  } catch {
    res.status(400).json({
      error: { code: 'INVALID_PATH', message: 'Cannot read directory.' },
    });
  }
});
