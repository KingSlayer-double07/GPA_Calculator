import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_GRADE_SCALE } from '../constants/gradeScale';
import { HistoryItem } from '../types';
import { loadGradeScale, loadHistory, saveGradeScale, saveHistory } from './storage';

// An in-memory stand-in for AsyncStorage, so the real storage module runs unchanged.
// vi.mock is hoisted above the imports, so what its factory uses has to be hoisted too.
const { store, failures } = vi.hoisted(() => ({
  store: new Map<string, string>(),
  failures: { read: false, write: false },
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => {
      if (failures.read) throw new Error('storage unavailable');
      return store.has(key) ? (store.get(key) as string) : null;
    }),
    setItem: vi.fn(async (key: string, value: string) => {
      if (failures.write) throw new Error('quota exceeded');
      store.set(key, value);
    }),
  },
}));

const LEGACY_HISTORY = JSON.stringify([
  { name: 'Year 1', gpa: '4.40' },
  { name: 'Broken', gpa: 'NaN' },
  { name: 'Year 2', gpa: '3.25' },
]);
const LEGACY_SCALE = JSON.stringify([
  { grade: 'A', points: '4' },
  { grade: 'B', points: 4 },
  { grade: 'C', points: 3 },
]);

const entry = (name: string): HistoryItem => ({ id: name, name, gpa: 4, createdAt: '2026-01-01T00:00:00.000Z' });

beforeEach(() => {
  store.clear();
  failures.read = false;
  failures.write = false;
});

describe('loadHistory / saveHistory', () => {
  it('starts empty', async () => {
    expect(await loadHistory()).toEqual([]);
  });

  it('round-trips through the versioned key', async () => {
    await saveHistory([entry('a'), entry('b')]);
    expect(store.has('gpaHistory.v2')).toBe(true);
    expect(await loadHistory()).toEqual([entry('a'), entry('b')]);
  });

  it('migrates legacy data when the new key was never written', async () => {
    store.set('gpaHistory', LEGACY_HISTORY);
    const items = await loadHistory();
    expect(items.map((i) => [i.name, i.gpa])).toEqual([['Year 1', 4.4], ['Year 2', 3.25]]);
    expect(items.every((i) => i.createdAt === null)).toBe(true);
  });

  it('never modifies or deletes the legacy key, so a rollback still finds its data', async () => {
    store.set('gpaHistory', LEGACY_HISTORY);
    await loadHistory();
    await saveHistory([entry('new')]);
    expect(store.get('gpaHistory')).toBe(LEGACY_HISTORY);
  });

  it('prefers the new key once it exists, so clearing is not undone by stale legacy data', async () => {
    store.set('gpaHistory', LEGACY_HISTORY);
    await saveHistory([]);
    expect(await loadHistory()).toEqual([]);
  });

  it('treats corrupt new data as empty instead of resurrecting legacy data or throwing', async () => {
    store.set('gpaHistory', LEGACY_HISTORY);
    store.set('gpaHistory.v2', '{not json');
    expect(await loadHistory()).toEqual([]);
  });

  it('treats corrupt legacy data as empty', async () => {
    store.set('gpaHistory', '[[[');
    expect(await loadHistory()).toEqual([]);
  });

  it('lets storage errors reach the caller', async () => {
    failures.read = true;
    await expect(loadHistory()).rejects.toThrow('storage unavailable');
    failures.read = false;
    failures.write = true;
    await expect(saveHistory([entry('a')])).rejects.toThrow('quota exceeded');
  });
});

describe('loadGradeScale / saveGradeScale', () => {
  it('starts with the defaults', async () => {
    expect(await loadGradeScale()).toEqual(DEFAULT_GRADE_SCALE);
  });

  it('round-trips an edited scale', async () => {
    const scale = DEFAULT_GRADE_SCALE.map((g) => (g.grade === 'A' ? { ...g, points: 4.5 } : g));
    await saveGradeScale(scale);
    expect(store.has('gradeScale.v2')).toBe(true);
    expect(await loadGradeScale()).toEqual(scale);
  });

  it('migrates a legacy scale to numbers and fills in the missing grades', async () => {
    store.set('gradeScale', LEGACY_SCALE);
    const scale = await loadGradeScale();
    expect(scale).toHaveLength(6);
    expect(scale[0]).toEqual({ grade: 'A', points: 4 });
    expect(scale.every((g) => typeof g.points === 'number')).toBe(true);
    expect(store.get('gradeScale')).toBe(LEGACY_SCALE);
  });

  it('survives corrupt data', async () => {
    store.set('gradeScale.v2', '[[[');
    expect(await loadGradeScale()).toEqual(DEFAULT_GRADE_SCALE);
  });

  it('lets storage errors reach the caller', async () => {
    failures.write = true;
    await expect(saveGradeScale(DEFAULT_GRADE_SCALE)).rejects.toThrow('quota exceeded');
  });
});
