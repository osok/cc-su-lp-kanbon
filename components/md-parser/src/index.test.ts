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

  it('should parse task details and merge into tasks', () => {
    const content = `# Core Tasks

| ID | Task | Status | Blocked-By | Agent | Notes |
|----|------|--------|------------|-------|-------|
| T001 | Setup project | complete | - | Developer | high |
| T002 | Build API | in-progress | T001 | Developer | |

---

## Task Details

### T001 -- Setup project

| Field | Value |
|-------|-------|
| **Status** | complete |
| **Agent** | Developer |
| **Requirements** | REQ-001-FN-001, REQ-001-FN-002 |
| **Component** | backend |
| **Files** | src/server.ts |
| **Acceptance** | Project builds without errors |

**Description:**
Initialize the project structure with TypeScript and Express.

**Resolution:**
Project initialized successfully with all dependencies.

---

### T002 -- Build API

| Field | Value |
|-------|-------|
| **Status** | in-progress |
| **Requirements** | REQ-001-FN-003 |
| **Design Ref** | 001-backend-design.md |

**Description:**
Build the REST API endpoints.

---`;
    const result = parseTaskFile(content, '001-core-tasks.md');

    expect(result.tasks).toHaveLength(2);

    // First task should have merged details
    const t1 = result.tasks[0];
    expect(t1.details).toBeDefined();
    expect(t1.details!.requirements).toEqual(['REQ-001-FN-001', 'REQ-001-FN-002']);
    expect(t1.details!.component).toBe('backend');
    expect(t1.details!.files).toEqual(['src/server.ts']);
    expect(t1.details!.acceptance).toBe('Project builds without errors');
    expect(t1.details!.description).toContain('Initialize the project structure');
    expect(t1.details!.resolution).toContain('Project initialized successfully');

    // Second task should have merged details
    const t2 = result.tasks[1];
    expect(t2.details).toBeDefined();
    expect(t2.details!.requirements).toEqual(['REQ-001-FN-003']);
    expect(t2.details!.designRef).toBe('001-backend-design.md');
    expect(t2.details!.description).toContain('Build the REST API endpoints');
    expect(t2.details!.resolution).toBe('');
  });

  it('should merge details using numeric suffix matching for long-form IDs', () => {
    const content = `# Tasks

| ID | Task | Status | Blocked-By | Agent | Notes |
|----|------|--------|------------|-------|-------|
| TASK-041-005 | Recording workflow | complete | - | Developer | |

---

### T005 -- Recording workflow

| Field | Value |
|-------|-------|
| **Requirements** | REQ-041-FN-014 |

**Description:**
Implement recording workflow handlers.

---`;
    const result = parseTaskFile(content, '041-tasks.md');
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].details).toBeDefined();
    expect(result.tasks[0].details!.requirements).toEqual(['REQ-041-FN-014']);
  });

  it('should handle files without task details section gracefully', () => {
    const content = `# Simple Tasks

| ID | Task | Status | Blocked-By | Agent | Notes |
|----|------|--------|------------|-------|-------|
| T001 | Do thing | pending | - | Developer | |
`;
    const result = parseTaskFile(content, '001-tasks.md');
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].details).toBeUndefined();
  });

  it('should warn on duplicate task IDs within a file', () => {
    const content = `# Dup Tasks

| ID | Task | Status | Blocked-By | Agent | Notes |
|----|------|--------|------------|-------|-------|
| T001 | First | pending | - | Developer | |
| T001 | Second | complete | - | Developer | |
| T002 | Third | pending | - | Developer | |
`;
    const result = parseTaskFile(content, '001-tasks.md');
    expect(result.tasks).toHaveLength(3);
    expect(result.warnings).toContain('Duplicate task ID "T001"');
  });
});
