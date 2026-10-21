import { describe, expect, it } from 'vitest';
import { DEFAULT_GRADE_SCALE } from '../constants/gradeScale';
import { Course, GradeScale } from '../types';
import { calculateGPA, formatGpa, getGradePoint, validateInputs } from './calculator';

const course = (name: string, credit: string, grade: string, id = name): Course => ({ id, name, credit, grade });

const FOUR_POINT_SCALE: GradeScale[] = [
  { grade: 'A', points: 4 },
  { grade: 'B', points: 3 },
  { grade: 'C', points: 2 },
  { grade: 'D', points: 1 },
  { grade: 'E', points: 0.5 },
  { grade: 'F', points: 0 },
];

describe('calculateGPA', () => {
  it('weights each grade by its units (3u B + 2u A on the 5-point scale = 4.4)', () => {
    const result = calculateGPA([course('MTH', '3', 'B'), course('PHY', '2', 'A')], DEFAULT_GRADE_SCALE);
    expect(result).toMatchObject({ isValid: true, gpa: 4.4, totalCredits: 5, totalPoints: 22 });
  });

  it('uses the scale it is given, not a built-in one', () => {
    const result = calculateGPA([course('MTH', '3', 'A')], FOUR_POINT_SCALE);
    expect(result).toMatchObject({ isValid: true, gpa: 4 });
  });

  it('handles every grade in the default scale, including E', () => {
    for (const { grade, points } of DEFAULT_GRADE_SCALE) {
      expect(calculateGPA([course('X', '2', grade)], DEFAULT_GRADE_SCALE)).toMatchObject({ isValid: true, gpa: points });
    }
  });

  it('is not case sensitive and records the grade in upper case', () => {
    const result = calculateGPA([course('X', '3', 'b')], DEFAULT_GRADE_SCALE);
    expect(result.isValid && result.courses[0].grade).toBe('B');
  });

  it('accepts fractional and comma-decimal units', () => {
    const result = calculateGPA([course('X', '1.5', 'A'), course('Y', '0,5', 'F')], DEFAULT_GRADE_SCALE);
    expect(result).toMatchObject({ isValid: true, totalCredits: 2, totalPoints: 7.5, gpa: 3.75 });
  });

  it('rounds the 4.005 case up to 4.01', () => {
    const scale = FOUR_POINT_SCALE.map((g) => (g.grade === 'B' ? { ...g, points: 4.01 } : g)).map((g) =>
      g.grade === 'C' ? { ...g, points: 4 } : g
    );
    const result = calculateGPA([course('X', '1', 'B'), course('Y', '1', 'C')], scale);
    expect(result).toMatchObject({ isValid: true, gpa: 4.01, totalPoints: 8.01, totalCredits: 2 });
  });

  it('does not accumulate floating-point noise in the totals', () => {
    const result = calculateGPA([course('X', '0.1', 'A'), course('Y', '0.2', 'A')], DEFAULT_GRADE_SCALE);
    expect(result).toMatchObject({ isValid: true, totalCredits: 0.3, gpa: 5 });
  });

  it('returns 0 when every course is an F', () => {
    expect(calculateGPA([course('X', '3', 'F'), course('Y', '2', 'F')], DEFAULT_GRADE_SCALE)).toMatchObject({
      isValid: true,
      gpa: 0,
    });
  });

  it('records each course with numeric units and the points its grade was worth', () => {
    const result = calculateGPA([course(' MTH 101 ', '3', 'B')], DEFAULT_GRADE_SCALE);
    expect(result.isValid && result.courses).toEqual([{ name: 'MTH 101', credit: 3, grade: 'B', points: 4 }]);
  });

  it.each([
    ['empty units', [course('X', '', 'A')]],
    ['empty grade', [course('X', '3', '')]],
    ['zero units', [course('X', '0', 'A')]],
    ['negative units', [course('X', '-3', 'A')]],
    ['Infinity units', [course('X', 'Infinity', 'A')]],
    ['hex units', [course('X', '0x10', 'A')]],
    ['unknown grade', [course('X', '3', 'Z')]],
    ['no courses', []],
  ])('is invalid for %s', (_label, courses) => {
    const result = calculateGPA(courses, DEFAULT_GRADE_SCALE);
    expect(result.isValid).toBe(false);
    expect(result.gpa).toBeNull();
    if (!result.isValid) expect(result.message).not.toBe('');
  });

  it('is invalid when one course is bad even if the others are fine', () => {
    expect(calculateGPA([course('X', '3', 'A'), course('Y', 'abc', 'B')], DEFAULT_GRADE_SCALE).isValid).toBe(false);
  });

  it('never drops a course with an unknown grade and calculates from the rest', () => {
    // If the bad course were skipped this would quietly return 5 (the GPA of the first course alone).
    const result = calculateGPA([course('X', '3', 'A'), course('Y', '3', 'Z')], DEFAULT_GRADE_SCALE);
    expect(result.isValid).toBe(false);
    if (!result.isValid) expect(result.message).toContain('"Z"');
  });
});

describe('getGradePoint', () => {
  it('returns the points for a grade, case-insensitively', () => {
    expect(getGradePoint('a', DEFAULT_GRADE_SCALE)).toBe(5);
    expect(getGradePoint('F', DEFAULT_GRADE_SCALE)).toBe(0);
  });

  it('returns null, not a magic number, for a grade that is not in the scale', () => {
    expect(getGradePoint('Z', DEFAULT_GRADE_SCALE)).toBeNull();
    expect(getGradePoint('', DEFAULT_GRADE_SCALE)).toBeNull();
  });
});

describe('formatGpa', () => {
  it('always shows two decimals', () => {
    expect(formatGpa(5)).toBe('5.00');
    expect(formatGpa(4.4)).toBe('4.40');
    expect(formatGpa(3.25)).toBe('3.25');
  });
});

describe('validateInputs', () => {
  const valid = [course('MTH 101', '3', 'A')];

  it('finds nothing wrong with a complete form', () => {
    expect(validateInputs('Year 1', valid, DEFAULT_GRADE_SCALE)).toEqual({ courses: [{}], count: 0 });
  });

  it('reports every missing field with its own message', () => {
    const errors = validateInputs('  ', [course('', '', '')], DEFAULT_GRADE_SCALE);
    expect(errors.name).toBe('Enter a name for this calculation.');
    expect(errors.courses[0]).toEqual({
      name: 'Enter the course name.',
      credit: 'Enter the units.',
      grade: 'Enter a grade.',
    });
    expect(errors.count).toBe(4);
  });

  it('keeps errors aligned with the courses they belong to', () => {
    const errors = validateInputs(
      'Year 1',
      [course('A', '3', 'A'), course('B', 'x', 'B'), course('C', '2', 'Z')],
      DEFAULT_GRADE_SCALE
    );
    expect(errors.courses[0]).toEqual({});
    expect(errors.courses[1]).toEqual({ credit: 'Units must be a number above 0.' });
    expect(errors.courses[2]).toEqual({ grade: 'Not in your grade scale.' });
    expect(errors.count).toBe(2);
  });

  it.each([['0'], ['-1'], ['abc'], ['Infinity'], ['0x10'], ['1e3']])('rejects %j as units', (credit) => {
    expect(validateInputs('Y', [course('A', credit, 'A')], DEFAULT_GRADE_SCALE).courses[0].credit).toBe(
      'Units must be a number above 0.'
    );
  });

  it('accepts a lower-case grade that is in the scale', () => {
    expect(validateInputs('Y', [course('A', '3', 'a')], DEFAULT_GRADE_SCALE).count).toBe(0);
  });

  it('agrees with calculateGPA: a form with no errors always calculates', () => {
    const forms: Course[][] = [
      [course('A', '3', 'A')],
      [course('A', '2.5', 'b'), course('B', '0,5', 'F')],
      [course('A', '.5', 'E')],
    ];
    for (const courses of forms) {
      expect(validateInputs('Y', courses, DEFAULT_GRADE_SCALE).count).toBe(0);
      expect(calculateGPA(courses, DEFAULT_GRADE_SCALE).isValid).toBe(true);
    }
  });
});
