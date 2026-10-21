import { describe, expect, it } from 'vitest';
import { DEFAULT_GRADE_SCALE } from '../constants/gradeScale';
import { HistoryItem } from '../types';
import { parseGradeScale, parseHistory, serializeGradeScale, serializeHistory, STORAGE_VERSION } from './persistence';

const roundTrip = (text: string): unknown => JSON.parse(text);

describe('parseGradeScale', () => {
  it('returns the defaults when nothing usable was saved', () => {
    for (const raw of [null, undefined, 'x', 42, {}, [], { scale: 'no' }]) {
      expect(parseGradeScale(raw)).toEqual(DEFAULT_GRADE_SCALE);
    }
  });

  it('does not hand out (or modify) the shared default array', () => {
    const scale = parseGradeScale(null);
    expect(scale).not.toBe(DEFAULT_GRADE_SCALE);
    scale[0].points = 99;
    expect(DEFAULT_GRADE_SCALE[0].points).toBe(5);
  });

  it('coerces the string points that version 1 saved', () => {
    const scale = parseGradeScale([
      { grade: 'A', points: '4' },
      { grade: 'B', points: 4 },
      { grade: 'C', points: '3.5' },
    ]);
    expect(scale.find((g) => g.grade === 'A')?.points).toBe(4);
    expect(scale.find((g) => g.grade === 'C')?.points).toBe(3.5);
    expect(scale.every((g) => typeof g.points === 'number')).toBe(true);
  });

  it('keeps usable values and defaults only the bad ones', () => {
    const scale = parseGradeScale([
      { grade: 'A', points: 4.5 },
      { grade: 'B', points: 'abc' },
      { grade: 'C', points: -1 },
      { grade: 'D', points: 1e9 },
      { grade: 'E', points: null },
    ]);
    expect(scale).toEqual([
      { grade: 'A', points: 4.5 },
      { grade: 'B', points: 4 },
      { grade: 'C', points: 3 },
      { grade: 'D', points: 2 },
      { grade: 'E', points: 1 },
      { grade: 'F', points: 0 },
    ]);
  });

  it('always returns every default grade in the default order, even if some were never saved', () => {
    const scale = parseGradeScale([{ grade: 'F', points: 0.5 }, { grade: 'A', points: 4 }]);
    expect(scale.map((g) => g.grade)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(scale[5].points).toBe(0.5);
  });

  it('matches grade letters case-insensitively and ignores grades it does not know', () => {
    const scale = parseGradeScale([{ grade: 'a', points: 3 }, { grade: 'S', points: 9 }, { grade: 7, points: 1 }, null, 'x']);
    expect(scale).toHaveLength(6);
    expect(scale[0]).toEqual({ grade: 'A', points: 3 });
  });

  it('accepts the version 2 envelope', () => {
    expect(parseGradeScale({ version: 2, scale: [{ grade: 'B', points: 3.5 }] })[1]).toEqual({ grade: 'B', points: 3.5 });
  });

  it('keeps the boundaries 0 and 10', () => {
    const scale = parseGradeScale([{ grade: 'A', points: 10 }, { grade: 'B', points: 0 }]);
    expect(scale[0].points).toBe(10);
    expect(scale[1].points).toBe(0);
  });
});

describe('parseHistory', () => {
  it('returns an empty list when nothing usable was saved', () => {
    for (const raw of [null, undefined, 'x', 42, {}, { items: 'no' }]) {
      expect(parseHistory(raw)).toEqual([]);
    }
  });

  it('migrates version 1 entries: numeric gpa, a generated id, and no invented date', () => {
    const items = parseHistory([
      { name: 'Year 1', gpa: '4.40' },
      { name: 'Year 2', gpa: '3.25' },
    ]);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ name: 'Year 1', gpa: 4.4, createdAt: null });
    expect(items[0].details).toBeUndefined();
    expect(items[0].id).toBeTruthy();
    expect(items[0].id).not.toBe(items[1].id);
  });

  it('drops entries that cannot be understood, like the "NaN" ones the old Infinity bug saved', () => {
    const items = parseHistory([
      { name: 'ok', gpa: '4.00' },
      { name: 'bad', gpa: 'NaN' },
      { name: 'bad2', gpa: 'Infinity' },
      { name: 'bad3' },
      { gpa: null },
      null,
      'text',
      [1, 2],
    ]);
    expect(items.map((i) => i.name)).toEqual(['ok']);
  });

  it('keeps ids, dates and details of version 2 entries', () => {
    const saved: HistoryItem = {
      id: 'abc',
      name: 'Sem 1',
      gpa: 4.4,
      createdAt: '2026-01-02T03:04:05.000Z',
      details: {
        totalCredits: 5,
        totalPoints: 22,
        courses: [{ name: 'MTH', credit: 3, grade: 'B', points: 4 }],
        gradeScale: DEFAULT_GRADE_SCALE,
      },
    };
    expect(parseHistory(roundTrip(serializeHistory([saved])))).toEqual([saved]);
  });

  it('turns an invalid date into null instead of keeping text that is not a date', () => {
    expect(parseHistory([{ name: 'x', gpa: 1, createdAt: 'not a date' }])[0].createdAt).toBeNull();
    expect(parseHistory([{ name: 'x', gpa: 1, createdAt: 12345 }])[0].createdAt).toBeNull();
  });

  it('keeps the entry but drops details that are malformed', () => {
    const items = parseHistory([
      { id: '1', name: 'a', gpa: 1, createdAt: null, details: { totalCredits: 'x', totalPoints: 1, courses: [], gradeScale: [] } },
      { id: '2', name: 'b', gpa: 2, createdAt: null, details: { totalCredits: 1, totalPoints: 1, courses: [{ credit: 'abc' }], gradeScale: [] } },
      { id: '3', name: 'c', gpa: 3, createdAt: null, details: 'nope' },
    ]);
    expect(items.map((i) => i.name)).toEqual(['a', 'b', 'c']);
    expect(items.every((i) => i.details === undefined)).toBe(true);
  });

  it('repairs the grade scale stored inside details', () => {
    const [item] = parseHistory([
      {
        id: '1',
        name: 'a',
        gpa: 1,
        createdAt: null,
        details: { totalCredits: 1, totalPoints: 1, courses: [], gradeScale: [{ grade: 'A', points: '4' }] },
      },
    ]);
    expect(item.details?.gradeScale).toHaveLength(6);
    expect(item.details?.gradeScale[0].points).toBe(4);
  });

  it('keeps the order of entries', () => {
    const items = parseHistory([{ name: 'new', gpa: 1 }, { name: 'old', gpa: 2 }]);
    expect(items.map((i) => i.name)).toEqual(['new', 'old']);
  });
});

describe('serialize', () => {
  it('writes the current version', () => {
    expect(roundTrip(serializeHistory([]))).toEqual({ version: STORAGE_VERSION, items: [] });
    expect(roundTrip(serializeGradeScale(DEFAULT_GRADE_SCALE))).toEqual({ version: STORAGE_VERSION, scale: DEFAULT_GRADE_SCALE });
  });

  it('round-trips a grade scale', () => {
    const scale = DEFAULT_GRADE_SCALE.map((g) => ({ ...g, points: g.points / 2 }));
    expect(parseGradeScale(roundTrip(serializeGradeScale(scale)))).toEqual(scale);
  });
});
