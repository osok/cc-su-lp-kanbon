/**
 * Global error handling middleware.
 * Requirements: IR-FS-003, NR-REL-002, NR-REL-003
 */
import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('Unhandled error:', err.message);

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    },
    meta: {
      timestamp: new Date().toISOString(),
      pollCycle: 0,
    },
  });
}
