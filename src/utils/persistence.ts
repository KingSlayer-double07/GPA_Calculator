import { DEFAULT_GRADE_SCALE, MAX_GRADE_POINTS, MIN_GRADE_POINTS } from '../constants/gradeScale';
import { CalculatedCourse, GradeScale, HistoryDetails, HistoryItem } from '../types';
import { makeId } from './course';
import { parseDecimal } from './number';

// Pure helpers that turn whatever was found in storage into data the app can trust.
// Nothing here touches AsyncStorage, so it can be tested on its own.

/**
 * Version of the saved format.
 *   1: bare arrays; history items were { name, gpa: "4.40" }; grade points could be strings
 *   2: { version, items } / { version, scale }; history items have an id, numeric gpa, createdAt and details
 */
export const STORAGE_VERSION = 2;

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Accepts a number or a numeric string such as "4.40" (how version 1 stored values). */
const toNumber = (value: unknown): number | null => {
  if (isFiniteNumber(value)) return value;
  if (typeof value === 'string') return parseDecimal(value);
  return null;
};

const toIsoDate = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  return Number.isNaN(new Date(value).getTime()) ? null : value;
};

/**
 * Returns a complete, valid grade scale. Every default grade is present, in the default order; a saved
 * value is used only when it is a number inside the allowed range, otherwise the default stands.
 * Accepts the version 1 array (points may be strings) and the version 2 envelope.
 */
export const parseGradeScale = (raw: unknown): GradeScale[] => {
  const saved = Array.isArray(raw) ? raw : isRecord(raw) && Array.isArray(raw.scale) ? raw.scale : [];

  return DEFAULT_GRADE_SCALE.map((fallback) => {
    const match = saved.find(
      (entry) => isRecord(entry) && typeof entry.grade === 'string' && entry.grade.toUpperCase() === fallback.grade
    ) as UnknownRecord | undefined;
    const points = match ? toNumber(match.points) : null;
    const valid = points !== null && points >= MIN_GRADE_POINTS && points <= MAX_GRADE_POINTS;
    return { grade: fallback.grade, points: valid ? points : fallback.points };
  });
};

const parseCourse = (raw: unknown): CalculatedCourse | null => {
  if (!isRecord(raw) || typeof raw.grade !== 'string') return null;
  const credit = toNumber(raw.credit);
  const points = toNumber(raw.points);
  if (credit === null || points === null) return null;
  return { name: typeof raw.name === 'string' ? raw.name : '', credit, grade: raw.grade, points };
};

const parseDetails = (raw: unknown): HistoryDetails | undefined => {
  if (!isRecord(raw) || !Array.isArray(raw.courses)) return undefined;
  const totalCredits = toNumber(raw.totalCredits);
  const totalPoints = toNumber(raw.totalPoints);
  if (totalCredits === null || totalPoints === null) return undefined;

  const courses = raw.courses.map(parseCourse);
  if (courses.some((course) => course === null)) return undefined;

  return {
    totalCredits,
    totalPoints,
    courses: courses as CalculatedCourse[],
    gradeScale: parseGradeScale(raw.gradeScale),
  };
};

const parseHistoryItem = (raw: unknown): HistoryItem | null => {
  if (!isRecord(raw)) return null;
  const gpa = toNumber(raw.gpa);
  if (gpa === null) return null;

  const item: HistoryItem = {
    // Version 1 entries had no id; one is made up here and saved with the next change.
    id: typeof raw.id === 'string' && raw.id ? raw.id : makeId(),
    name: typeof raw.name === 'string' ? raw.name : '',
    gpa,
    createdAt: toIsoDate(raw.createdAt),
  };
  const details = parseDetails(raw.details);
  if (details) item.details = details;
  return item;
};

/**
 * Returns the usable history entries. Accepts the version 1 array and the version 2 envelope; entries
 * that cannot be understood are dropped rather than breaking the whole list.
 */
export const parseHistory = (raw: unknown): HistoryItem[] => {
  const entries = Array.isArray(raw) ? raw : isRecord(raw) && Array.isArray(raw.items) ? raw.items : [];
  return entries.map(parseHistoryItem).filter((item): item is HistoryItem => item !== null);
};

export const serializeHistory = (items: HistoryItem[]): string =>
  JSON.stringify({ version: STORAGE_VERSION, items });

export const serializeGradeScale = (scale: GradeScale[]): string =>
  JSON.stringify({ version: STORAGE_VERSION, scale });
