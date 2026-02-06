/**
 * Unit tests for status-normalizer module.
 * Test plan: TP-004 through TP-007
 */
import { describe, it, expect } from 'vitest';
import { normalizeStatus } from './status-normalizer.js';

describe('normalizeStatus', () => {
  // TP-004: Normalize "complete" status variants
  it('should normalize complete variants', () => {
    expect(normalizeStatus('complete')).toBe('complete');
    expect(normalizeStatus('completed')).toBe('complete');
    expect(normalizeStatus('done')).toBe('complete');
    expect(normalizeStatus('COMPLETE')).toBe('complete');
    expect(normalizeStatus('  Complete  ')).toBe('complete');
  });

  // TP-005: Normalize "in-progress" status variants
  it('should normalize in-progress variants', () => {
    expect(normalizeStatus('in progress')).toBe('in-progress');
    expect(normalizeStatus('in-progress')).toBe('in-progress');
    expect(normalizeStatus('active')).toBe('in-progress');
    expect(normalizeStatus('wip')).toBe('in-progress');
    expect(normalizeStatus('WIP')).toBe('in-progress');
  });

  // TP-006: Normalize "pending" status variants
  it('should normalize pending variants', () => {
    expect(normalizeStatus('pending')).toBe('pending');
    expect(normalizeStatus('todo')).toBe('pending');
    expect(normalizeStatus('not started')).toBe('pending');
    expect(normalizeStatus('queued')).toBe('pending');
  });

  // TP-007: Normalize unknown status to pending
  it('should map unknown status to pending', () => {
    expect(normalizeStatus('unknown-status')).toBe('pending');
    expect(normalizeStatus('something-else')).toBe('pending');
    expect(normalizeStatus('')).toBe('pending');
  });

  it('should normalize blocked status', () => {
    expect(normalizeStatus('blocked')).toBe('blocked');
    expect(normalizeStatus('BLOCKED')).toBe('blocked');
  });

  it('should normalize deferred status variants', () => {
    expect(normalizeStatus('deferred')).toBe('deferred');
    expect(normalizeStatus('deferred (not blocking)')).toBe('deferred');
    expect(normalizeStatus('skipped')).toBe('deferred');
  });
});
