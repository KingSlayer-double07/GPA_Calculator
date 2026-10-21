import AsyncStorage from '@react-native-async-storage/async-storage';
import { GradeScale, HistoryItem } from '../types';
import { parseGradeScale, parseHistory, serializeGradeScale, serializeHistory } from './persistence';

// Reads and writes let storage errors propagate so the UI can tell the user when something was not saved.
// Stored text that cannot be parsed is treated as "nothing saved" instead of an error, so one bad value
// can never lock the app out of saving again.

const HISTORY_KEY = 'gpaHistory.v2';
const GRADE_SCALE_KEY = 'gradeScale.v2';

// Version 1 keys. They are read once to migrate and then left untouched, so rolling back to an
// older deploy still finds the data it expects.
const LEGACY_HISTORY_KEY = 'gpaHistory';
const LEGACY_GRADE_SCALE_KEY = 'gradeScale';

const readJson = async (key: string): Promise<{ exists: boolean; value: unknown }> => {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return { exists: false, value: null };
  try {
    return { exists: true, value: JSON.parse(raw) };
  } catch {
    return { exists: true, value: null };
  }
};

/** Prefers the current key; falls back to the legacy one only when the current key was never written. */
const readWithMigration = async (key: string, legacyKey: string): Promise<unknown> => {
  const current = await readJson(key);
  if (current.exists) return current.value;
  return (await readJson(legacyKey)).value;
};

export const saveHistory = async (history: HistoryItem[]): Promise<void> => {
  await AsyncStorage.setItem(HISTORY_KEY, serializeHistory(history));
};

export const loadHistory = async (): Promise<HistoryItem[]> =>
  parseHistory(await readWithMigration(HISTORY_KEY, LEGACY_HISTORY_KEY));

export const saveGradeScale = async (gradeScale: GradeScale[]): Promise<void> => {
  await AsyncStorage.setItem(GRADE_SCALE_KEY, serializeGradeScale(gradeScale));
};

/** Always returns a complete, valid scale: saved points where they are usable, defaults elsewhere. */
export const loadGradeScale = async (): Promise<GradeScale[]> =>
  parseGradeScale(await readWithMigration(GRADE_SCALE_KEY, LEGACY_GRADE_SCALE_KEY));
