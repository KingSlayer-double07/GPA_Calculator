/**
 * Parses decimal text typed by a user ("3", "2.5", ".5", "2,5").
 * Returns null for anything that is not a plain finite decimal, so values such as
 * "Infinity", "0x10", "1e3" or "" are rejected instead of being coerced by Number()/parseFloat().
 */
export const parseDecimal = (text: string): number | null => {
  const normalized = text.trim().replace(',', '.');
  if (!/^(\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
};
