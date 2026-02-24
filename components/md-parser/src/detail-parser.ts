/**
 * Detail parsing module.
 * Parses per-task detail blocks from the "Task Details" section.
 * Each block starts with a ### heading containing the task ID,
 * followed by a Field/Value metadata table and optional
 * Description/Resolution text blocks.
 */
import type { TaskDetail } from '@kanban/types';

/** Heading pattern: ### T001 -- Title  or  ### TASK-001-015 -- Title
 *  Supports: -- (double hyphen), — (em-dash U+2014), – (en-dash U+2013), ― (horizontal bar U+2015) */
const HEADING_PATTERN = /^###\s+(T[\w-]+)\s+(?:--|—|–|―)\s+/;

/** Field/Value table row: | **FieldName** | value | */
const FIELD_ROW_PATTERN = /^\|\s*\*\*(.+?)\*\*\s*\|\s*(.*?)\s*\|$/;

/**
 * Parse task detail blocks from markdown content.
 *
 * @param content - Full markdown file content
 * @returns Map of task ID fragment (e.g., "T001") to TaskDetail
 */
export function parseTaskDetails(content: string): Map<string, TaskDetail> {
  const details = new Map<string, TaskDetail>();
  const lines = content.split('\n');

  let i = 0;
  while (i < lines.length) {
    const match = lines[i].match(HEADING_PATTERN);
    if (!match) {
      i++;
      continue;
    }

    const taskIdFragment = match[1];

    // Find the extent of this detail block (until next ### heading or --- separator)
    const blockStart = i + 1;
    let blockEnd = lines.length;
    for (let j = blockStart; j < lines.length; j++) {
      if (lines[j].match(/^###\s+/)) {
        blockEnd = j;
        break;
      }
      // A --- on its own line ends the block, but only after we've seen content
      if (j > blockStart && lines[j].trim() === '---') {
        blockEnd = j;
        break;
      }
    }

    const blockLines = lines.slice(blockStart, blockEnd);
    const detail = parseDetailBlock(blockLines);
    details.set(taskIdFragment, detail);

    i = blockEnd;
  }

  return details;
}

/**
 * Parse a single detail block's lines into a TaskDetail.
 */
function parseDetailBlock(lines: string[]): TaskDetail {
  const detail: TaskDetail = {
    requirements: [],
    designRef: '',
    component: '',
    files: [],
    acceptance: '',
    description: '',
    resolution: '',
  };

  let mode: 'table' | 'description' | 'resolution' = 'table';
  const descLines: string[] = [];
  const resLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect text block headers
    if (/^\*\*Description:\*\*/.test(trimmed)) {
      mode = 'description';
      // Check if there's inline content after the header
      const inline = trimmed.replace(/^\*\*Description:\*\*/, '').trim();
      if (inline) descLines.push(inline);
      continue;
    }
    if (/^\*\*Resolution:\*\*/.test(trimmed)) {
      mode = 'resolution';
      const inline = trimmed.replace(/^\*\*Resolution:\*\*/, '').trim();
      if (inline) resLines.push(inline);
      continue;
    }

    // If in a text block, collect lines
    if (mode === 'description') {
      descLines.push(line);
      continue;
    }
    if (mode === 'resolution') {
      resLines.push(line);
      continue;
    }

    // Try to parse as a Field/Value table row
    const tableMatch = trimmed.match(FIELD_ROW_PATTERN);
    if (tableMatch) {
      const field = tableMatch[1].toLowerCase().trim();
      const value = tableMatch[2].trim();

      switch (field) {
        case 'requirements':
          detail.requirements = value.split(',').map(s => s.trim()).filter(Boolean);
          break;
        case 'design ref':
          detail.designRef = value;
          break;
        case 'component':
          detail.component = value;
          break;
        case 'files':
          detail.files = value.split(',').map(s => s.trim()).filter(Boolean);
          break;
        case 'acceptance':
          detail.acceptance = value;
          break;
        // Status, Agent, Blocked-By already in summary table - skip
      }
    }
  }

  detail.description = descLines.join('\n').trim();
  detail.resolution = resLines.join('\n').trim();

  return detail;
}
