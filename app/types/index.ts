export interface HistoryItem {
  name: string;
  gpa: string;
}

export interface GradeScale {
  grade: string;
  points: number;
}

export interface Course {
  name: string;
  credit: string;
  grade: string;
}

export type ActiveSection = 'calculator' | 'history' | 'settings'; 