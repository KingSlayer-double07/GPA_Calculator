import { Course, GradeScale } from '../types';

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
    const creditNum = parseFloat(credit);
    if (isNaN(creditNum) || creditNum <= 0) {
      isValid = false;
      message = "Credit must be a positive number.";
      return;
    }
    const gradePoint = getGradePoint(grade, gradeScale);
    if (!isNaN(creditNum) && gradePoint !== null) {
      totalCredits += creditNum;
      totalPoints += creditNum * gradePoint;
    }
  });

  if (!isValid) {
    return { isValid, gpa: null, message };
  }

  const calculatedGPA = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : null;
  return { isValid: true, gpa: calculatedGPA };
};

export const getGradePoint = (grade: string, gradeScale: GradeScale[]): number => {
  const gradeScaleItem = gradeScale.find(g => g.grade === grade.toUpperCase());
  return gradeScaleItem ? gradeScaleItem.points : -1;
}; 