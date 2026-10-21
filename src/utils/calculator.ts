import { CalculatedCourse, Course, GradeScale } from '../types';
import { parseDecimal, roundTo } from './number';

export interface CourseErrors {
  name?: string;
  credit?: string;
  grade?: string;
}

export interface ValidationErrors {
  name?: string;
  /** One entry per course, in the same order as the course list. */
  courses: CourseErrors[];
  /** Total number of problems found. */
  count: number;
}

/** Checks the whole form and returns a message for every field that is wrong. */
export const validateInputs = (
  gpaName: string,
  courses: Course[],
  gradeScale: GradeScale[]
): ValidationErrors => {
  let count = 0;
  const fail = (message: string) => {
    count += 1;
    return message;
  };

  const errors: ValidationErrors = { courses: [], count: 0 };

  if (!gpaName.trim()) {
    errors.name = fail('Enter a name for this calculation.');
  }

  courses.forEach((course) => {
    const courseErrors: CourseErrors = {};

    if (!course.name.trim()) {
      courseErrors.name = fail('Enter the course name.');
    }

    if (!course.credit.trim()) {
      courseErrors.credit = fail('Enter the units.');
    } else {
      const credit = parseDecimal(course.credit);
      if (credit === null || credit <= 0) {
        courseErrors.credit = fail('Units must be a number above 0.');
      }
    }

    if (!course.grade.trim()) {
      courseErrors.grade = fail('Enter a grade.');
    } else if (!gradeScale.some((g) => g.grade === course.grade.toUpperCase())) {
      courseErrors.grade = fail('Not in your grade scale.');
    }

    errors.courses.push(courseErrors);
  });

  errors.count = count;
  return errors;
};

export type CalculationResult =
  | {
      isValid: true;
      /** Rounded to two decimal places. */
      gpa: number;
      totalCredits: number;
      totalPoints: number;
      courses: CalculatedCourse[];
    }
  | { isValid: false; gpa: null; message: string };

export const calculateGPA = (courses: Course[], gradeScale: GradeScale[]): CalculationResult => {
  const calculated: CalculatedCourse[] = [];
  let totalCredits = 0;
  let totalPoints = 0;

  for (const course of courses) {
    const { name, credit, grade } = course;
    if (!grade.trim() || !credit.trim()) {
      return { isValid: false, gpa: null, message: 'All fields (Grade and Credit) must be filled before calculating GPA.' };
    }
    const creditNum = parseDecimal(credit);
    if (creditNum === null || creditNum <= 0) {
      return { isValid: false, gpa: null, message: 'Credit must be a positive number.' };
    }
    const gradePoint = getGradePoint(grade, gradeScale);
    if (gradePoint === null) {
      return { isValid: false, gpa: null, message: `Grade "${grade}" is not in the grade scale.` };
    }
    calculated.push({ name: name.trim(), credit: creditNum, grade: grade.toUpperCase(), points: gradePoint });
    totalCredits += creditNum;
    totalPoints += creditNum * gradePoint;
  }

  if (totalCredits <= 0) {
    return { isValid: false, gpa: null, message: 'Add at least one course with units above 0.' };
  }

  // Trim floating-point noise (0.1 + 0.2) before dividing, so the stored totals reproduce the stored GPA.
  const credits = roundTo(totalCredits, 4);
  const points = roundTo(totalPoints, 4);
  return {
    isValid: true,
    gpa: roundTo(points / credits, 2),
    totalCredits: credits,
    totalPoints: points,
    courses: calculated,
  };
};

/** GPA as shown to the user, always two decimal places. */
export const formatGpa = (gpa: number): string => gpa.toFixed(2);

export const getGradePoint = (grade: string, gradeScale: GradeScale[]): number | null => {
  const gradeScaleItem = gradeScale.find((g) => g.grade === grade.toUpperCase());
  return gradeScaleItem ? gradeScaleItem.points : null;
};
