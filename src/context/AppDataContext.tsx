import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GradeScale, HistoryItem } from '../types';
import { DEFAULT_GRADE_SCALE } from '../constants/gradeScale';
import { loadGradeScale, loadHistory, saveGradeScale, saveHistory } from '../utils/storage';

interface AppData {
  /** False until the saved history and grade scale have been read. */
  isLoaded: boolean;
  history: HistoryItem[];
  gradeScale: GradeScale[];
  /** Set when data could not be read or saved on this device. */
  storageError: string | null;
  addHistoryItem: (item: HistoryItem) => void;
  clearHistory: () => void;
  setGradePoints: (grade: string, points: number) => void;
  resetGradeScale: () => void;
  dismissStorageError: () => void;
}

const AppDataContext = createContext<AppData | null>(null);

const SAVE_FAILED = 'Your changes could not be saved on this device and may be lost when you close the app.';
const LOAD_FAILED =
  'Your saved history and grade scale could not be read. Defaults are being used, and changes made now will not be kept.';

/**
 * Owns the data that is shared between tabs (history and grade scale) and keeps it in storage.
 * Mounted once at the root so switching tabs never loses or reloads anything.
 */
export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [gradeScale, setGradeScale] = useState<GradeScale[]>(DEFAULT_GRADE_SCALE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Latest values, so back-to-back actions build on each other rather than on a stale render.
  const historyRef = useRef(history);
  const gradeScaleRef = useRef(gradeScale);
  const loadedRef = useRef(false);
  // Writing is enabled only after a successful read, so a failed read can never overwrite saved data.
  const canPersistRef = useRef(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [savedHistory, savedScale] = await Promise.all([loadHistory(), loadGradeScale()]);
        if (!active) return;
        historyRef.current = savedHistory;
        setHistory(savedHistory);
        if (savedScale) {
          gradeScaleRef.current = savedScale;
          setGradeScale(savedScale);
        }
        canPersistRef.current = true;
      } catch (error) {
        console.error('Error loading saved data:', error);
        if (active) setStorageError(LOAD_FAILED);
      } finally {
        if (active) {
          loadedRef.current = true;
          setIsLoaded(true);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (save: () => Promise<void>) => {
    if (!canPersistRef.current) return;
    try {
      await save();
    } catch (error) {
      console.error('Error saving data:', error);
      setStorageError(SAVE_FAILED);
    }
  }, []);

  const commitHistory = useCallback(
    (next: HistoryItem[]) => {
      historyRef.current = next;
      setHistory(next);
      void persist(() => saveHistory(next));
    },
    [persist]
  );

  const commitGradeScale = useCallback(
    (next: GradeScale[]) => {
      gradeScaleRef.current = next;
      setGradeScale(next);
      void persist(() => saveGradeScale(next));
    },
    [persist]
  );

  const value = useMemo<AppData>(
    () => ({
      isLoaded,
      history,
      gradeScale,
      storageError,
      addHistoryItem: (item) => {
        if (loadedRef.current) commitHistory([item, ...historyRef.current]);
      },
      clearHistory: () => {
        if (loadedRef.current) commitHistory([]);
      },
      setGradePoints: (grade, points) => {
        if (!loadedRef.current) return;
        commitGradeScale(gradeScaleRef.current.map((g) => (g.grade === grade ? { ...g, points } : g)));
      },
      resetGradeScale: () => {
        if (loadedRef.current) commitGradeScale(DEFAULT_GRADE_SCALE);
      },
      dismissStorageError: () => setStorageError(null),
    }),
    [isLoaded, history, gradeScale, storageError, commitHistory, commitGradeScale]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = (): AppData => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used inside <AppDataProvider>');
  return context;
};
