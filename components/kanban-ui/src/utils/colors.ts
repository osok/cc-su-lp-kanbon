/**
 * Sequence color assignment utilities.
 * Source: design-docs/01-style-guide.md, Appendix D
 */

/** Known sequence accent color CSS variable names */
const KNOWN_SEQUENCE_COLORS: Record<string, string> = {
  '001': 'var(--seq-001)',
  '002': 'var(--seq-002)',
  '003': 'var(--seq-003)',
  '004': 'var(--seq-004)',
  '005': 'var(--seq-005)',
  '006': 'var(--seq-006)',
  '007': 'var(--seq-007)',
};

/** Extended palette for auto-assignment beyond known sequences */
const EXTENDED_PALETTE = [
  '#E11D48', '#9333EA', '#2563EB', '#0891B2',
  '#059669', '#CA8A04', '#EA580C', '#DC2626',
  '#7C3AED', '#0284C7', '#0D9488', '#D97706',
];

/**
 * Get the accent color for a sequence ID.
 * Known sequences use CSS custom properties.
 * Unknown sequences get auto-assigned colors from the extended palette.
 */
export function getSequenceColor(sequenceId: string): string {
  if (KNOWN_SEQUENCE_COLORS[sequenceId]) {
    return KNOWN_SEQUENCE_COLORS[sequenceId];
  }

  // Auto-assign from extended palette based on sequence number
  const num = parseInt(sequenceId, 10) || 0;
  return EXTENDED_PALETTE[num % EXTENDED_PALETTE.length];
}

/**
 * Get the CSS variable name for a status color.
 */
export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    'complete': 'var(--status-complete)',
    'in-progress': 'var(--status-in-progress)',
    'blocked': 'var(--status-blocked)',
    'pending': 'var(--status-pending)',
    'deferred': 'var(--status-deferred)',
  };
  return statusMap[status] || 'var(--status-pending)';
}
