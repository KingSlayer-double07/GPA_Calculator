import { GradeScale } from '../types';

export const DEFAULT_GRADE_SCALE: GradeScale[] = [
  { grade: 'A', points: 5 },
  { grade: 'B', points: 4 },
  { grade: 'C', points: 3 },
  { grade: 'D', points: 2 },
  { grade: 'E', points: 1 },
  { grade: 'F', points: 0 }
];

// Allowed range when editing the points for a grade (covers 4.0, 5.0 and 10-point scales).
export const MIN_GRADE_POINTS = 0;
export const MAX_GRADE_POINTS = 10;
