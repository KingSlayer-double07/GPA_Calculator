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

/**
 * Rounds to a number of decimal places the way a person would ("1.005" -> 1.01), which
 * Math.round(x * 100) / 100 and toFixed() get wrong for values like 1.005 that are not exact in binary.
 */
export const roundTo = (value: number, places: number): number => {
  const rounded = Number(`${Math.round(Number(`${value}e${places}`))}e-${places}`);
  return Number.isFinite(rounded) ? rounded : Number(value.toFixed(places));
};
