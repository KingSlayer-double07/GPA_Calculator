import { Animated } from 'react-native';

export interface Course {
  name: string;
  credit: string;
  grade: string;
}

export interface HistoryItem {
  name: string;
  gpa: string;
}

export interface GradeScale {
  grade: string;
  points: string;
}

export type ActiveSection = 'calculator' | 'history' | 'settings';

export interface CalculatorSectionProps {
  gpaName: string;
  setGpaName: (name: string) => void;
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  gpa: number | null;
  isCalculating: boolean;
  onAddCourse: () => void;
  onRemoveCourse: (index: number) => void;
  onCalculate: () => void;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  resultAnim: Animated.Value;
}

export interface HistorySectionProps {
  history: HistoryItem[];
  isLoadingHistory: boolean;
  isSaving: boolean;
  onClearHistory: () => void;
  fadeAnim: Animated.Value;
}

export interface SettingsSectionProps {
  gradeScale: GradeScale[];
  showGradeScaleModal: boolean;
  editingGrade: GradeScale | null;
  onEditGrade: (grade: GradeScale) => void;
  onUpdateGrade: (grade: GradeScale) => void;
  onResetGradeScale: () => void;
  onCloseModal: () => void;
  fadeAnim: Animated.Value;
} 