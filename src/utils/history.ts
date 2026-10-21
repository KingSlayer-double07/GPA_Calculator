import { HistoryItem } from '../types';
import { roundTo } from './number';

const formatDate = (iso: string | null): string | null => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/**
 * One line under a history entry, e.g. "3 courses · 10 units · 21 Oct 2026".
 * Parts that were not recorded (entries saved by older versions) are left out, so nothing is made up.
 */
export const describeHistoryItem = (item: HistoryItem): string => {
  const parts: string[] = [];
  if (item.details) {
    parts.push(plural(item.details.courses.length, 'course', 'courses'));
    parts.push(plural(roundTo(item.details.totalCredits, 2), 'unit', 'units'));
  }
  const date = formatDate(item.createdAt);
  if (date) parts.push(date);
  return parts.join(' · ');
};
