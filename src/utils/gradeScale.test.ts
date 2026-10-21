import { describe, expect, it } from 'vitest';
import { parseGradePoints } from './gradeScale';

describe('parseGradePoints', () => {
  it.each([
    ['4', 4],
    ['3.5', 3.5],
    ['3,5', 3.5],
    ['0', 0],
    ['10', 10],
    ['  5 ', 5],
  ])('accepts %j', (text, value) => {
    expect(parseGradePoints(text)).toEqual({ value });
  });

  it('rounds to two decimal places', () => {
    expect(parseGradePoints('2.345')).toEqual({ value: 2.35 });
    expect(parseGradePoints('4.001')).toEqual({ value: 4 });
  });

  it.each([[''], ['.'], ['abc'], ['-1'], ['11'], ['10.01'], ['1e2'], ['0x5'], ['Infinity']])(
    'rejects %j with a message',
    (text) => {
      const result = parseGradePoints(text);
      expect('error' in result).toBe(true);
      if ('error' in result) expect(result.error).toContain('0 to 10');
    }
  );
});
