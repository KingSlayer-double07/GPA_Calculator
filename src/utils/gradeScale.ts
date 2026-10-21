import { MIN_GRADE_POINTS, MAX_GRADE_POINTS } from '../constants/gradeScale';
import { parseDecimal, roundTo } from './number';

export type GradePointsResult = { value: number } | { error: string };

/** Validates the text typed for a grade's points. Accepts decimals; rounds to 2 decimal places. */
export const parseGradePoints = (text: string): GradePointsResult => {
  const value = parseDecimal(text);
  if (value === null || value < MIN_GRADE_POINTS || value > MAX_GRADE_POINTS) {
    return { error: `Enter a number from ${MIN_GRADE_POINTS} to ${MAX_GRADE_POINTS}, for example 3.5.` };
  }
  return { value: roundTo(value, 2) };
};
