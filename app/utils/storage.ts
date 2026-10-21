import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItem, GradeScale } from '../types';

// These helpers let errors propagate so the UI can tell the user when something was not saved.

export const saveHistory = async (history: HistoryItem[]): Promise<void> => {
  await AsyncStorage.setItem('gpaHistory', JSON.stringify(history));
};

export const loadHistory = async (): Promise<HistoryItem[]> => {
  const savedHistory = await AsyncStorage.getItem('gpaHistory');
  return savedHistory ? JSON.parse(savedHistory) : [];
};

export const saveGradeScale = async (gradeScale: GradeScale[]): Promise<void> => {
  await AsyncStorage.setItem('gradeScale', JSON.stringify(gradeScale));
};

export const loadGradeScale = async (): Promise<GradeScale[] | null> => {
  const savedScale = await AsyncStorage.getItem('gradeScale');
  return savedScale ? JSON.parse(savedScale) : null;
};
