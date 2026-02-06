/**
 * Unit tests for dependency-parser module.
 * Test plan: TP-008 through TP-011
 */
import { describe, it, expect } from 'vitest';
import { parseDependencies } from './dependency-parser.js';

describe('parseDependencies', () => {
  // TP-008: Parse single dependency
  it('should parse a single dependency', () => {
    expect(parseDependencies('TASK-001-005')).toEqual(['TASK-001-005']);
    expect(parseDependencies('T005')).toEqual(['T005']);
  });

  // TP-009: Parse comma-separated dependencies
  it('should parse comma-separated dependencies', () => {
    expect(parseDependencies('TASK-001-062, TASK-001-063')).toEqual([
      'TASK-001-062',
      'TASK-001-063',
    ]);
  });

  // TP-010: Parse range dependencies
  it('should parse range dependencies with through', () => {
    expect(parseDependencies('TASK-001-062 through TASK-001-065')).toEqual([
      'TASK-001-062',
      'TASK-001-063',
      'TASK-001-064',
      'TASK-001-065',
    ]);
  });

  // TP-011: Parse empty/dash dependency
  it('should return empty array for dash', () => {
    expect(parseDependencies('-')).toEqual([]);
  });

  it('should return empty array for empty string', () => {
    expect(parseDependencies('')).toEqual([]);
  });

  it('should return empty array for whitespace', () => {
    expect(parseDependencies('  ')).toEqual([]);
  });

  it('should handle multiple comma-separated dependencies', () => {
    expect(parseDependencies('T001, T002, T003')).toEqual(['T001', 'T002', 'T003']);
  });
});
