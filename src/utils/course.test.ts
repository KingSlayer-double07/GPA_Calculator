import { describe, expect, it } from 'vitest';
import { createCourse, makeId } from './course';

describe('makeId', () => {
  it('does not repeat, even when called many times in the same millisecond', () => {
    const ids = new Set(Array.from({ length: 5000 }, () => makeId()));
    expect(ids.size).toBe(5000);
  });
});

describe('createCourse', () => {
  it('starts empty with its own id', () => {
    const a = createCourse();
    const b = createCourse();
    expect(a).toMatchObject({ name: '', credit: '', grade: '' });
    expect(a.id).not.toBe(b.id);
  });
});
