import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItem, GradeScale } from '../types';

// Reads and writes let storage errors propagate so the UI can tell the user when something was not saved.
// Stored text that cannot be parsed is treated as "nothing saved" instead of an error, so one bad value
// can never lock the app out of saving again.

const readJson = async (key: string): Promise<unknown> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveHistory = async (history: HistoryItem[]): Promise<void> => {
  await AsyncStorage.setItem('gpaHistory', JSON.stringify(history));
};

export const loadHistory = async (): Promise<HistoryItem[]> => {
  const saved = await readJson('gpaHistory');
  return Array.isArray(saved) ? (saved as HistoryItem[]) : [];
};

export const saveGradeScale = async (gradeScale: GradeScale[]): Promise<void> => {
  await AsyncStorage.setItem('gradeScale', JSON.stringify(gradeScale));
};

export const loadGradeScale = async (): Promise<GradeScale[] | null> => {
  const saved = await readJson('gradeScale');
  return Array.isArray(saved) ? (saved as GradeScale[]) : null;
};
