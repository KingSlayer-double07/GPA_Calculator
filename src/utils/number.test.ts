import { describe, expect, it } from 'vitest';
import { parseDecimal, roundTo } from './number';

describe('parseDecimal', () => {
  it.each([
    ['3', 3],
    ['2.5', 2.5],
    ['.5', 0.5],
    ['3.', 3],
    ['0', 0],
    ['  4  ', 4],
    ['2,5', 2.5],
    ['007', 7],
  ])('accepts %j', (text, expected) => {
    expect(parseDecimal(text)).toBe(expected);
  });

  it.each([
    [''],
    ['   '],
    ['abc'],
    ['Infinity'],
    ['-Infinity'],
    ['NaN'],
    ['0x10'],
    ['1e3'],
    ['-2'],
    ['+2'],
    ['1.2.3'],
    ['1,2,3'],
    ['.'],
    ['3 4'],
    ['9'.repeat(400)],
  ])('rejects %j', (text) => {
    expect(parseDecimal(text)).toBeNull();
  });
});

describe('roundTo', () => {
  it('rounds half up on the decimal value, where toFixed does not', () => {
    // 1.005 and 4.005 are slightly below the true value in binary, so toFixed(2) gives x.00
    expect((1.005).toFixed(2)).toBe('1.00');
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(4.005, 2)).toBe(4.01);
    expect(roundTo(2.345, 2)).toBe(2.35);
    expect(roundTo(1.255, 2)).toBe(1.26);
  });

  it('leaves values that need no rounding alone', () => {
    expect(roundTo(0, 2)).toBe(0);
    expect(roundTo(3, 2)).toBe(3);
    expect(roundTo(4.4, 2)).toBe(4.4);
    expect(roundTo(3.14, 2)).toBe(3.14);
  });

  it('removes floating-point noise', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(roundTo(0.1 + 0.2, 4)).toBe(0.3);
  });

  it('rounds down when below half', () => {
    expect(roundTo(1.004, 2)).toBe(1);
    expect(roundTo(3.3333333, 2)).toBe(3.33);
  });
});
