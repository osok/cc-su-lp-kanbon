/**
 * Express server setup with middleware and route mounting.
 * Requirements: DC-001, NR-SEC-001
 */
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { tasksRouter } from './routes/tasks.js';
import { sequencesRouter } from './routes/sequences.js';
import { statusRouter } from './routes/status.js';
import { configRouter } from './routes/config.js';
import { errorHandler } from './middleware/error-handler.js';
import type { PollManager } from './services/poll-manager.js';
import type { ConfigStore } from './services/config-store.js';

export interface ServerDeps {
  pollManager: PollManager;
  configStore: ConfigStore;
}

export function createApp(deps: ServerDeps): express.Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(cors({ origin: 'http://localhost:3000' }));

  // Make deps available to routes
  app.locals.pollManager = deps.pollManager;
  app.locals.configStore = deps.configStore;

  // API routes
  app.use('/api/tasks', tasksRouter);
  app.use('/api/sequences', sequencesRouter);
  app.use('/api/status', statusRouter);
  app.use('/api/config', configRouter);

  // Static file serving (production) - serve built frontend
  const staticPath = path.join(__dirname, '../../kanban-ui/dist');
  app.use(express.static(staticPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(staticPath, 'index.html'), (err) => {
      if (err) next();
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
