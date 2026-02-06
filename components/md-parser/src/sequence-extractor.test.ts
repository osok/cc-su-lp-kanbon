/**
 * Unit tests for sequence-extractor module.
 * Test plan: TP-012 through TP-014
 */
import { describe, it, expect } from 'vitest';
import { extractSequenceId, extractSequenceName } from './sequence-extractor.js';

describe('extractSequenceId', () => {
  // TP-012: Extract sequence ID from filename
  it('should extract sequence ID from filename', () => {
    expect(extractSequenceId('003-project-manager-tasks.md', '')).toBe('003');
    expect(extractSequenceId('001-ai-tester-core-tasks.md', '')).toBe('001');
  });

  // TP-013: Extract sequence ID from content
  it('should extract sequence ID from content when filename has no pattern', () => {
    expect(extractSequenceId('tasks.md', 'Seq: 003\nSome content')).toBe('003');
    expect(extractSequenceId('tasks.md', 'Seq 005\nOther content')).toBe('005');
  });

  it('should return 000 when no ID found', () => {
    expect(extractSequenceId('tasks.md', 'No sequence info here')).toBe('000');
  });
});

describe('extractSequenceName', () => {
  // TP-014: Extract sequence name from H1 heading
  it('should extract name from H1 heading', () => {
    expect(extractSequenceName('# ProjectManagerAgent Task List\n\nContent', 'file.md'))
      .toBe('ProjectManagerAgent');
  });

  it('should extract name removing Tasks suffix', () => {
    expect(extractSequenceName('# Core Tasks\n\nContent', 'file.md'))
      .toBe('Core');
  });

  it('should derive name from filename as fallback', () => {
    expect(extractSequenceName('No heading here', '003-project-manager-tasks.md'))
      .toBe('project-manager');
  });

  it('should use filename without extension as last resort', () => {
    expect(extractSequenceName('No heading', 'custom-file.md'))
      .toBe('custom-file');
  });
});
