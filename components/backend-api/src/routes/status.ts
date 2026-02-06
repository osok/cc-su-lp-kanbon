/**
 * Status API route.
 * GET /api/status - Returns system health information.
 * Requirements: IR-API-003, IR-API-006
 */
import { Router } from 'express';
import type { PollManager } from '../services/poll-manager.js';

export const statusRouter = Router();

statusRouter.get('/', (req, res) => {
  const pollManager = req.app.locals.pollManager as PollManager;

  res.json({
    data: pollManager.getStatus(),
    meta: {
      timestamp: new Date().toISOString(),
      pollCycle: pollManager.pollCycle,
    },
  });
});
