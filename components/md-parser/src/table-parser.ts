/**
 * Table parsing module.
 * Finds and parses markdown tables into raw row data.
 * Requirements: FR-PRS-001, FR-PRS-002, FR-PRS-003, FR-PRS-004, FR-PRS-008
 */

/** Column mapping from header text to canonical field names */
const COLUMN_MAP: Record<string, string> = {
  'id': 'id',
  'task': 'task',
  'status': 'status',
  'blocked-by': 'blockedBy',
  'blocked by': 'blockedBy',
  'blockedby': 'blockedBy',
  'agent': 'agent',
  'priority': 'priority',
  'notes': 'priority',
  'note': 'priority',
};

/** Required columns that must be present for a valid task table */
const REQUIRED_COLUMNS = ['id', 'task', 'status'];

export interface RawTableRow {
  id: string;
  task: string;
  status: string;
  blockedBy: string;
  agent: string;
  priority: string;
}

export interface TableParseResult {
  rows: RawTableRow[];
  warnings: string[];
}

/**
 * Split a pipe-delimited row into trimmed cell values.
 * Handles leading/trailing pipes.
 */
function splitRow(line: string): string[] {
  // Remove leading and trailing pipes, then split
  const trimmed = line.replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map(cell => cell.trim());
}

/**
 * Check if a line is a table row (starts and ends with pipe or starts with pipe).
 */
function isTableRow(line: string): boolean {
  return /^\|.+\|$/.test(line.trim());
}

/**
 * Check if a line is a separator row (e.g., |---|---|---|).
 */
function isSeparatorRow(line: string): boolean {
  return /^\|[\s\-:]+(\|[\s\-:]+)*\|$/.test(line.trim());
}

/**
 * Check if a row is a section marker (bold text in first cell, other cells empty).
 * e.g., | **Architecture Phase** |
 * FR-PRS-003
 */
function isSectionMarker(cells: string[]): boolean {
  if (cells.length === 0) return false;
  const firstCell = cells[0];
  const hasContent = cells.slice(1).some(c => c.length > 0);
  return /^\*\*.+\*\*$/.test(firstCell) && !hasContent;
}

/**
 * Find and parse the first task table in the markdown content.
 * Returns parsed rows and any warnings.
 */
export function parseTable(content: string): TableParseResult {
  const warnings: string[] = [];
  const lines = content.split('\n');
  const rows: RawTableRow[] = [];

  // Step 1: Find the table header line
  let headerLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (isTableRow(line) && i + 1 < lines.length && isSeparatorRow(lines[i + 1].trim())) {
      headerLineIdx = i;
      break;
    }
  }

  if (headerLineIdx === -1) {
    // No table found - not an error per FR-DIR-005
    return { rows: [], warnings: [] };
  }

  // Step 2: Parse column headers
  const headerCells = splitRow(lines[headerLineIdx]);
  const columnMap: Map<number, string> = new Map();

  for (let i = 0; i < headerCells.length; i++) {
    const headerText = headerCells[i].toLowerCase().trim();
    const canonical = COLUMN_MAP[headerText];
    if (canonical) {
      columnMap.set(i, canonical);
    }
  }

  // Validate required columns
  const mappedColumns = new Set(columnMap.values());
  const missingColumns = REQUIRED_COLUMNS.filter(col => !mappedColumns.has(col));
  if (missingColumns.length > 0) {
    warnings.push(`Missing required columns: ${missingColumns.join(', ')}`);
    return { rows: [], warnings };
  }

  // Step 3: Parse data rows (skip header and separator)
  for (let i = headerLineIdx + 2; i < lines.length; i++) {
    const line = lines[i].trim();

    // End of table: non-pipe line or empty line
    if (!line || !isTableRow(line)) break;

    const cells = splitRow(line);

    // Skip section markers (FR-PRS-003)
    if (isSectionMarker(cells)) continue;

    // Build row from column mapping
    const row: Record<string, string> = {
      id: '',
      task: '',
      status: '',
      blockedBy: '',
      agent: '',
      priority: '',
    };

    let hasData = false;
    for (const [colIdx, fieldName] of columnMap.entries()) {
      if (colIdx < cells.length) {
        row[fieldName] = cells[colIdx];
        if (cells[colIdx]) hasData = true;
      }
    }

    // Skip empty/malformed rows (FR-PRS-008)
    if (!hasData || !row.id) {
      warnings.push(`Skipped malformed row at line ${i + 1}`);
      continue;
    }

    rows.push(row as unknown as RawTableRow);
  }

  return { rows, warnings };
}
