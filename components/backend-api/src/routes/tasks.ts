/**
 * Tasks API route.
 * GET /api/tasks - Returns all parsed task data.
 * Requirements: IR-API-001, IR-API-006
 */
import { Router } from 'express';
import type { PollManager } from '../services/poll-manager.js';

export const tasksRouter = Router();

tasksRouter.get('/', (req, res) => {
  const pollManager = req.app.locals.pollManager as PollManager;

  if (!pollManager.directory) {
    res.status(503).json({
      error: {
        code: 'NO_DIRECTORY',
        message: 'No task directory configured. Use POST /api/config/directory to set one.',
      },
      meta: {
        timestamp: new Date().toISOString(),
        pollCycle: 0,
      },
    });
    return;
  }

  res.json({
    data: {
      tasks: pollManager.getAllTasks(),
      changes: pollManager.getChanges(),
    },
    meta: {
      timestamp: new Date().toISOString(),
      pollCycle: pollManager.pollCycle,
    },
  });
});
