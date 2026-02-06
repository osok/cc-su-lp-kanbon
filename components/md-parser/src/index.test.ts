/**
 * Integration tests for md-parser public API.
 * Tests the parseTaskFile function end-to-end.
 */
import { describe, it, expect } from 'vitest';
import { parseTaskFile } from './index.js';

describe('parseTaskFile', () => {
  it('should parse a complete task file', () => {
    const content = `# Core Task List
Seq: 001

| ID | Task | Status | Blocked-By | Agent | Priority |
|----|------|--------|------------|-------|----------|
| TASK-001-001 | Project Setup | complete | - | Developer | critical |
| TASK-001-002 | Build API | in-progress | TASK-001-001 | Developer | high |
| TASK-001-003 | Write tests | pending | TASK-001-002 | Test Coder | medium |
`;
    const result = parseTaskFile(content, '001-core-tasks.md');

    expect(result.tasks).toHaveLength(3);
    expect(result.warnings).toHaveLength(0);

    // Check first task
    expect(result.tasks[0]).toEqual(expect.objectContaining({
      taskId: 'TASK-001-001',
      taskName: 'Project Setup',
      status: 'complete',
      blockedBy: [],
      agent: 'Developer',
      priority: 'critical',
      sequenceId: '001',
      sourceFile: '001-core-tasks.md',
    }));

    // Check second task has dependency
    expect(result.tasks[1].blockedBy).toEqual(['TASK-001-001']);

    // Check sequence metadata
    expect(result.sequence.sequenceId).toBe('001');
    expect(result.sequence.sequenceName).toBe('Core');
    expect(result.sequence.totalTasks).toBe(3);
    expect(result.sequence.completedTasks).toBe(1);
    expect(result.sequence.statusBreakdown.complete).toBe(1);
    expect(result.sequence.statusBreakdown['in-progress']).toBe(1);
    expect(result.sequence.statusBreakdown.pending).toBe(1);
  });

  it('should handle file with section markers', () => {
    const content = `# ProjectManagerAgent Task List

| ID | Task | Status | Blocked-By | Agent | Notes |
|----|------|--------|------------|-------|-------|
| **Design Phase** |
| TASK-003-001 | Architecture | complete | - | Architect | |
| **Implementation Phase** |
| TASK-003-002 | Implement | in-progress | TASK-003-001 | Developer | |
`;
    const result = parseTaskFile(content, '003-project-manager-tasks.md');

    expect(result.tasks).toHaveLength(2);
    expect(result.sequence.sequenceId).toBe('003');
    expect(result.sequence.sequenceName).toBe('ProjectManagerAgent');
  });

  it('should handle file with no table', () => {
    const content = '# Just a readme\n\nNo tables here.';
    const result = parseTaskFile(content, 'readme.md');

    expect(result.tasks).toHaveLength(0);
    expect(result.sequence.totalTasks).toBe(0);
  });
});
