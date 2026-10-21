export interface Course {
  id: string;
  name: string;
  credit: string;
  grade: string;
}

export interface GradeScale {
  grade: string;
  points: number;
}

/** One course as it was calculated: numbers, not the text the user typed. */
export interface CalculatedCourse {
  name: string;
  credit: number;
  grade: string;
  /** Grade points the grade was worth at the time. */
  points: number;
}

/** Everything needed to combine this result with others later (e.g. a cumulative GPA). */
export interface HistoryDetails {
  totalCredits: number;
  totalPoints: number;
  courses: CalculatedCourse[];
  gradeScale: GradeScale[];
}

export interface HistoryItem {
  id: string;
  name: string;
  gpa: number;
  /** ISO timestamp. Null for entries saved before the date was recorded. */
  createdAt: string | null;
  /** Absent for entries saved before the details were recorded. */
  details?: HistoryDetails;
}
