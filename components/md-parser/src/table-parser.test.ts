/**
 * Unit tests for table-parser module.
 * Test plan: TP-001 through TP-003, TP-015 through TP-018
 */
import { describe, it, expect } from 'vitest';
import { parseTable } from './table-parser.js';

describe('parseTable', () => {
  // TP-001: Parse simple table (Pattern 1)
  it('should parse a simple task table', () => {
    const content = `# Test Tasks

| ID | Task | Status | Blocked-By | Agent | Priority |
|----|------|--------|------------|-------|----------|
| TASK-001-001 | Project Setup | complete | - | developer | critical |
| TASK-001-002 | Build API | in-progress | TASK-001-001 | developer | high |
`;
    const result = parseTable(content);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].id).toBe('TASK-001-001');
    expect(result.rows[0].task).toBe('Project Setup');
    expect(result.rows[0].status).toBe('complete');
    expect(result.rows[0].blockedBy).toBe('-');
    expect(result.rows[0].agent).toBe('developer');
    expect(result.rows[0].priority).toBe('critical');
    expect(result.warnings).toHaveLength(0);
  });

  // TP-002: Parse table with section markers (Pattern 2)
  it('should skip section markers in tables', () => {
    const content = `| ID | Task | Status | Blocked-By | Agent | Notes |
|----|------|--------|------------|-------|-------|
| **Architecture Phase** |
| TASK-003-001 | Architectural decisions | complete | - | Architect | ADR-019 created |
| **Implementation Phase** |
| TASK-003-002 | Implement handler | pending | TASK-003-001 | Developer | |
`;
    const result = parseTable(content);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].id).toBe('TASK-003-001');
    expect(result.rows[1].id).toBe('TASK-003-002');
    expect(result.warnings).toHaveLength(0);
  });

  // TP-003: Parse compact table (Pattern 3)
  it('should parse compact task table', () => {
    const content = `| ID | Task | Status | Blocked-By | Agent | Notes |
|----|------|--------|------------|-------|-------|
| TASK-007-001 | Fix test_detect_credit | complete | - | Developer | Added variants |
`;
    const result = parseTable(content);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].id).toBe('TASK-007-001');
    expect(result.rows[0].priority).toBe('Added variants');
  });

  // TP-015: Handle malformed row gracefully
  it('should skip malformed rows and add warning', () => {
    const content = `| ID | Task | Status | Blocked-By | Agent | Notes |
|----|------|--------|------------|-------|-------|
| TASK-001-001 | Valid task | complete | - | Dev | |
| | | | | | |
| TASK-001-002 | Another task | pending | - | Dev | |
`;
    const result = parseTable(content);
    expect(result.rows).toHaveLength(2);
    expect(result.warnings.length).toBeGreaterThanOrEqual(1);
  });

  // TP-016: Handle file with no table
  it('should return empty result for file with no table', () => {
    const content = `# Just a Readme

This is a regular markdown file with no tables.

Some more text here.
`;
    const result = parseTable(content);
    expect(result.rows).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  // TP-017: Column header variations
  it('should handle Blocked By vs Blocked-By', () => {
    const content = `| ID | Task | Status | Blocked By | Agent | Notes |
|----|------|--------|------------|-------|-------|
| T001 | Test task | pending | T000 | Dev | |
`;
    const result = parseTable(content);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].blockedBy).toBe('T000');
  });

  // TP-018: Case insensitive column headers
  it('should handle case-insensitive column headers', () => {
    const content = `| id | TASK | STATUS | blocked-by | AGENT | notes |
|----|------|--------|------------|-------|-------|
| T001 | Test task | COMPLETE | - | Dev | note |
`;
    const result = parseTable(content);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].id).toBe('T001');
    expect(result.rows[0].status).toBe('COMPLETE');
  });

  it('should handle missing optional columns', () => {
    const content = `| ID | Task | Status |
|----|------|--------|
| T001 | Test task | pending |
`;
    const result = parseTable(content);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].agent).toBe('');
    expect(result.rows[0].priority).toBe('');
  });

  it('should return warning for missing required columns', () => {
    const content = `| Name | Description |
|------|-------------|
| Something | A thing |
`;
    const result = parseTable(content);
    expect(result.rows).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('Missing required columns');
  });
});
