import { Course, GradeScale } from '../types';
import { parseDecimal } from './number';

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

/** GPA as shown to the user, always two decimal places. */
export const formatGpa = (gpa: number): string => gpa.toFixed(2);

export const calculateGPA = (
  courses: Course[],
  gradeScale: GradeScale[]
): { isValid: boolean; gpa: number | null; message?: string } => {
  let totalCredits = 0;
  let totalPoints = 0;
  let isValid = true;
  let message = '';

  courses.forEach(({ credit, grade }) => {
    if (!grade.trim() || !credit.trim()) {
      isValid = false;
      message = "All fields (Grade and Credit) must be filled before calculating GPA.";
      return;
    }
    const creditNum = parseDecimal(credit);
    if (creditNum === null || creditNum <= 0) {
      isValid = false;
      message = "Credit must be a positive number.";
      return;
    }
    const gradePoint = getGradePoint(grade, gradeScale);
    if (gradePoint === null) {
      isValid = false;
      message = `Grade "${grade}" is not in the grade scale.`;
      return;
    }
    totalCredits += creditNum;
    totalPoints += creditNum * gradePoint;
  });

  if (!isValid) {
    return { isValid, gpa: null, message };
  }

  const calculatedGPA = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : null;
  return { isValid: true, gpa: calculatedGPA };
};

export const getGradePoint = (grade: string, gradeScale: GradeScale[]): number | null => {
  const gradeScaleItem = gradeScale.find(g => g.grade === grade.toUpperCase());
  return gradeScaleItem ? Number(gradeScaleItem.points) : null;
};
