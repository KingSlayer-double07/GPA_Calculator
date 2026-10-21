export interface Course {
  id: string;
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
  points: number;
}
