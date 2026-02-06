/**
 * Status normalization module.
 * Maps raw status strings to canonical StatusType values.
 * Requirements: FR-PRS-005, Appendix B
 */
import type { StatusType } from '@kanban/types';

const STATUS_MAP: Record<string, StatusType> = {
  'complete': 'complete',
  'completed': 'complete',
  'done': 'complete',
  'in progress': 'in-progress',
  'in-progress': 'in-progress',
  'active': 'in-progress',
  'wip': 'in-progress',
  'pending': 'pending',
  'todo': 'pending',
  'not started': 'pending',
  'queued': 'pending',
  'blocked': 'blocked',
  'deferred': 'deferred',
  'deferred (not blocking)': 'deferred',
  'skipped': 'deferred',
};

/**
 * Normalize a raw status string to a canonical StatusType.
 * Unknown values map to 'pending'.
 */
export function normalizeStatus(raw: string): StatusType {
  const normalized = raw.trim().toLowerCase();
  return STATUS_MAP[normalized] ?? 'pending';
}
