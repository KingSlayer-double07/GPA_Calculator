import { Course } from '../types';

let counter = 0;

/** Unique enough for list keys within a session; not meant to be cryptographically random. */
export const makeId = (): string =>
  `${Date.now().toString(36)}-${(counter++).toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const createCourse = (): Course => ({ id: makeId(), name: '', credit: '', grade: '' });
