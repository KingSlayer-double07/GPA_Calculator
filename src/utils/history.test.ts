import { describe, expect, it } from 'vitest';
import { DEFAULT_GRADE_SCALE } from '../constants/gradeScale';
import { HistoryItem } from '../types';
import { describeHistoryItem } from './history';

const item = (overrides: Partial<HistoryItem> = {}): HistoryItem => ({
  id: '1',
  name: 'Sem 1',
  gpa: 4.4,
  createdAt: '2026-10-21T12:00:00.000Z',
  ...overrides,
});

const details = (courses: number, totalCredits: number) => ({
  totalCredits,
  totalPoints: totalCredits * 4,
  courses: new Array(courses).fill({ name: 'X', credit: 1, grade: 'B', points: 4 }),
  gradeScale: DEFAULT_GRADE_SCALE,
});

describe('describeHistoryItem', () => {
  it('lists courses, units and the date', () => {
    expect(describeHistoryItem(item({ details: details(3, 10) }))).toMatch(/^3 courses · 10 units · .*2026/);
  });

  it('uses singular forms', () => {
    expect(describeHistoryItem(item({ details: details(1, 1) }))).toMatch(/^1 course · 1 unit · /);
  });

  it('trims float noise in the units', () => {
    expect(describeHistoryItem(item({ details: details(2, 0.30000000000000004) }))).toMatch(/^2 courses · 0\.3 units/);
  });

  it('shows only the date when there are no details (entries from older versions)', () => {
    const text = describeHistoryItem(item());
    expect(text).toMatch(/2026/);
    expect(text).not.toContain('course');
  });

  it('shows nothing at all when neither details nor a date were recorded, instead of inventing one', () => {
    expect(describeHistoryItem(item({ createdAt: null }))).toBe('');
  });

  it('ignores a date it cannot read', () => {
    expect(describeHistoryItem(item({ createdAt: 'garbage' }))).toBe('');
  });
});
