import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItem, GradeScale } from '../types';

export const saveHistory = async (history: HistoryItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem('gpaHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Error saving history:', error);
  }
};

export const loadHistory = async (): Promise<HistoryItem[]> => {
  try {
    const savedHistory = await AsyncStorage.getItem('gpaHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
};

export const saveGradeScale = async (gradeScale: GradeScale[]): Promise<void> => {
  try {
    await AsyncStorage.setItem('gradeScale', JSON.stringify(gradeScale));
  } catch (error) {
    console.error('Error saving grade scale:', error);
  }
};

export const loadGradeScale = async (): Promise<GradeScale[] | null> => {
  try {
    const savedScale = await AsyncStorage.getItem('gradeScale');
    return savedScale ? JSON.parse(savedScale) : null;
  } catch (error) {
    console.error('Error loading grade scale:', error);
    return null;
  }
}; 