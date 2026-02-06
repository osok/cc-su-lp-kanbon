/**
 * Dependency parsing module.
 * Parses Blocked-By field values into arrays of task ID strings.
 * Requirements: FR-DEP-001, FR-DEP-002
 */

/**
 * Expand a "through" range notation into individual IDs.
 * e.g., "TASK-001-062 through TASK-001-065" => ["TASK-001-062", "TASK-001-063", "TASK-001-064", "TASK-001-065"]
 */
function expandRange(start: string, end: string): string[] {
  const startMatch = start.match(/^(.+?)(\d+)$/);
  const endMatch = end.match(/^(.+?)(\d+)$/);
  if (!startMatch || !endMatch) return [start, end];

  const prefix = startMatch[1];
  const startNum = parseInt(startMatch[2], 10);
  const endNum = parseInt(endMatch[2], 10);
  const padLen = startMatch[2].length;

  const result: string[] = [];
  for (let i = startNum; i <= endNum; i++) {
    result.push(prefix + String(i).padStart(padLen, '0'));
  }
  return result;
}

/**
 * Parse the Blocked-By field value into an array of task IDs.
 *
 * Supports:
 * - Single reference: "TASK-001-005" or "T005"
 * - Comma-separated: "TASK-001-062, TASK-001-063"
 * - Range notation: "TASK-001-062 through TASK-001-070"
 * - Empty/dash: "-" or "" => []
 */
export function parseDependencies(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '-') return [];

  // Check for "through" range notation
  const rangeMatch = trimmed.match(/^(.+?)\s+through\s+(.+)$/i);
  if (rangeMatch) {
    return expandRange(rangeMatch[1].trim(), rangeMatch[2].trim());
  }

  // Comma-separated list (also handles single values)
  return trimmed.split(',').map(s => s.trim()).filter(Boolean);
}
