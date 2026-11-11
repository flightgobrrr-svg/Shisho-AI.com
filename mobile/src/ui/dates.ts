const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "10 January 2026". Written by hand rather than via Intl so it is identical on every device. */
export function formatDate(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * A real calendar date from three text fields, or null. Rejects 31 February,
 * month 13 and years outside 1900-2200, rather than letting Date roll them
 * over into a different day.
 */
export function parseDate(day: string, month: string, year: string): Date | null {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (![d, m, y].every(Number.isInteger) || day === "" || month === "" || year.length !== 4) return null;
  if (y < 1900 || y > 2200 || m < 1 || m > 12 || d < 1) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date : null;
}
