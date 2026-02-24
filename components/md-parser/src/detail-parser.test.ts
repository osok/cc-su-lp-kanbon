import { describe, it, expect } from 'vitest';
import { parseTaskDetails } from './detail-parser.js';

describe('parseTaskDetails', () => {
  it('should parse a single task detail block with all fields', () => {
    const content = `### T001 -- Project Setup

| Field | Value |
|-------|-------|
| **Status** | complete |
| **Agent** | Developer |
| **Requirements** | REQ-001-FN-001, REQ-001-FN-002 |
| **Design Ref** | 001-design.md |
| **Component** | backend-api |
| **Files** | src/server.ts, src/index.ts |
| **Acceptance** | Server starts without errors |

**Description:**
Set up the Express server with middleware.

**Resolution:**
Created server.ts with error handling middleware.

---`;
    const result = parseTaskDetails(content);
    expect(result.size).toBe(1);

    const detail = result.get('T001')!;
    expect(detail).toBeDefined();
    expect(detail.requirements).toEqual(['REQ-001-FN-001', 'REQ-001-FN-002']);
    expect(detail.designRef).toBe('001-design.md');
    expect(detail.component).toBe('backend-api');
    expect(detail.files).toEqual(['src/server.ts', 'src/index.ts']);
    expect(detail.acceptance).toBe('Server starts without errors');
    expect(detail.description).toBe('Set up the Express server with middleware.');
    expect(detail.resolution).toBe('Created server.ts with error handling middleware.');
  });

  it('should parse multiple task detail blocks', () => {
    const content = `### T001 -- First Task

| Field | Value |
|-------|-------|
| **Status** | complete |

**Description:**
First task description.

---

### T002 -- Second Task

| Field | Value |
|-------|-------|
| **Status** | pending |

**Description:**
Second task description.

---`;
    const result = parseTaskDetails(content);
    expect(result.size).toBe(2);
    expect(result.has('T001')).toBe(true);
    expect(result.has('T002')).toBe(true);
    expect(result.get('T001')!.description).toBe('First task description.');
    expect(result.get('T002')!.description).toBe('Second task description.');
  });

  it('should return empty map when no detail blocks exist', () => {
    const content = `# Task List

| ID | Task | Status |
|----|------|--------|
| T001 | Do thing | pending |
`;
    const result = parseTaskDetails(content);
    expect(result.size).toBe(0);
  });

  it('should handle detail block with no Description or Resolution', () => {
    const content = `### T001 -- Minimal Task

| Field | Value |
|-------|-------|
| **Component** | frontend |

---`;
    const result = parseTaskDetails(content);
    const detail = result.get('T001')!;
    expect(detail).toBeDefined();
    expect(detail.component).toBe('frontend');
    expect(detail.description).toBe('');
    expect(detail.resolution).toBe('');
  });

  it('should handle multi-line description and resolution', () => {
    const content = `### T001 -- Multi-line

| Field | Value |
|-------|-------|
| **Status** | complete |

**Description:**
Line one of description.
Line two of description.
Line three of description.

**Resolution:**
Line one of resolution.
Line two of resolution.

---`;
    const result = parseTaskDetails(content);
    const detail = result.get('T001')!;
    expect(detail.description).toContain('Line one of description.');
    expect(detail.description).toContain('Line two of description.');
    expect(detail.description).toContain('Line three of description.');
    expect(detail.resolution).toContain('Line one of resolution.');
    expect(detail.resolution).toContain('Line two of resolution.');
  });

  it('should handle em-dash separator in heading', () => {
    const content = `### T001 \u2014 Task With Em-Dash

| Field | Value |
|-------|-------|
| **Component** | backend |

---`;
    const result = parseTaskDetails(content);
    expect(result.has('T001')).toBe(true);
    expect(result.get('T001')!.component).toBe('backend');
  });

  it('should handle long-form task IDs like TASK-001-015', () => {
    const content = `### TASK-001-015 -- Auth Handler

| Field | Value |
|-------|-------|
| **Requirements** | REQ-001-FN-005 |

**Description:**
Implement auth.

---`;
    const result = parseTaskDetails(content);
    expect(result.has('TASK-001-015')).toBe(true);
    expect(result.get('TASK-001-015')!.requirements).toEqual(['REQ-001-FN-005']);
  });

  it('should handle blocks separated by next heading (no ---)', () => {
    const content = `### T001 -- First

| Field | Value |
|-------|-------|
| **Component** | a |

**Description:**
First desc.

### T002 -- Second

| Field | Value |
|-------|-------|
| **Component** | b |

**Description:**
Second desc.
`;
    const result = parseTaskDetails(content);
    expect(result.size).toBe(2);
    expect(result.get('T001')!.description).toBe('First desc.');
    expect(result.get('T002')!.description).toBe('Second desc.');
  });

  it('should skip unknown fields gracefully', () => {
    const content = `### T001 -- With Unknown Fields

| Field | Value |
|-------|-------|
| **Status** | complete |
| **Custom Field** | custom value |
| **Requirements** | REQ-001 |

---`;
    const result = parseTaskDetails(content);
    const detail = result.get('T001')!;
    expect(detail.requirements).toEqual(['REQ-001']);
  });

  it('should handle empty requirements and files', () => {
    const content = `### T001 -- Empty Lists

| Field | Value |
|-------|-------|
| **Requirements** | - |
| **Files** |  |

---`;
    const result = parseTaskDetails(content);
    const detail = result.get('T001')!;
    expect(detail.requirements).toEqual(['-']);
    expect(detail.files).toEqual([]);
  });
});
