/**
 * Sequence extraction module.
 * Extracts sequence ID and name from filename and file content.
 * Requirements: FR-PRS-006, FR-PRS-007
 */

/**
 * Extract the sequence ID from a filename or file content.
 *
 * Strategy:
 * 1. Try filename pattern: /^(\d{3})-/ => sequenceId
 * 2. If no match, scan content for "Seq: NNN" or "Seq NNN"
 * 3. Fallback: "000"
 */
export function extractSequenceId(filename: string, content: string): string {
  // Try filename pattern first
  const filenameMatch = filename.match(/^(\d{3})-/);
  if (filenameMatch) {
    return filenameMatch[1];
  }

  // Try content patterns
  const contentMatch = content.match(/Seq[:\s]+(\d{3})/i);
  if (contentMatch) {
    return contentMatch[1];
  }

  return '000';
}

/**
 * Extract the sequence/component name from file content or filename.
 *
 * Strategy:
 * 1. Look for H1 heading (# Title)
 * 2. Extract name portion (e.g., "ProjectManagerAgent Task List" => "ProjectManagerAgent")
 * 3. Fallback: derive from filename
 */
export function extractSequenceName(content: string, filename: string): string {
  // Look for H1 heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    const heading = headingMatch[1].trim();
    // Remove common suffixes like "Task List", "Tasks"
    const cleaned = heading
      .replace(/\s+Task\s*List$/i, '')
      .replace(/\s+Tasks$/i, '')
      .trim();
    if (cleaned) return cleaned;
  }

  // Derive from filename: "003-project-manager-tasks.md" => "project-manager"
  const fileMatch = filename.replace(/\.md$/i, '').match(/^\d{3}-(.+?)(?:-tasks?)?$/i);
  if (fileMatch) {
    return fileMatch[1];
  }

  return filename.replace(/\.md$/i, '');
}
