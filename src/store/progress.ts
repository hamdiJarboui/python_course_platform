import { createStore, useStore } from 'zustand';
import {
  completeLesson,
  emptyProgress,
  recordExercise,
  recordQuizAttempt,
  resetCourse,
  setLast,
  uncompleteLesson,
} from '@/core/progress';
import { browserStorage, PROGRESS_KEY } from '@/core/storage';
import type { LoadStatus, ProgressStorage } from '@/core/storage';
import type { ID, ProgressV1, QuizResult } from '@/core/types';

export interface ProgressState {
  progress: ProgressV1;
  /** How the stored data was loaded; `recovered` triggers a notice banner. */
  loadStatus: LoadStatus;
  notice?: string;
  /** False when localStorage is unavailable and progress only lives in memory. */
  persistent: boolean;

  completeLesson(courseId: ID, lessonId: ID): void;
  uncompleteLesson(courseId: ID, lessonId: ID): void;
  recordQuiz(courseId: ID, quizId: ID, result: Pick<QuizResult, 'score' | 'passed'>): void;
  recordExercise(courseId: ID, exerciseId: string, passed: boolean): void;
  setLast(courseId: ID, id: ID): void;
  resetCourse(courseId: ID): void;
  exportJson(): string;
  importJson(text: string): { ok: true } | { ok: false; error: string };
  dismissNotice(): void;
}

/** Factory so tests can inject a storage; the app uses {@link progressStore}. */
export function createProgressStore(storage: ProgressStorage) {
  const loaded = storage.load();

  const store = createStore<ProgressState>()((set, get) => {
    const update = (fn: (p: ProgressV1) => ProgressV1): void => {
      const prev = get().progress;
      const next = fn(prev);
      if (next === prev) return;
      storage.save(next);
      set({ progress: next });
    };
    return {
      progress: loaded.progress,
      loadStatus: loaded.status,
      ...(loaded.message !== undefined && { notice: loaded.message }),
      persistent: storage.persistent,

      completeLesson: (c, l) => update((p) => completeLesson(p, c, l)),
      uncompleteLesson: (c, l) => update((p) => uncompleteLesson(p, c, l)),
      recordQuiz: (c, q, r) => update((p) => recordQuizAttempt(p, c, q, r)),
      recordExercise: (c, e, passed) => update((p) => recordExercise(p, c, e, passed)),
      setLast: (c, id) => update((p) => setLast(p, c, id)),
      resetCourse: (c) => update((p) => resetCourse(p, c)),
      exportJson: () => storage.exportJson(get().progress),
      importJson: (text) => {
        const r = storage.importJson(text);
        if (!r.ok) return r;
        storage.save(r.progress);
        set({ progress: r.progress });
        return { ok: true };
      },
      dismissNotice: () => set({ notice: undefined }),
    };
  });

  // Keep several tabs in sync.
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key !== PROGRESS_KEY) return;
      const fresh = storage.load();
      store.setState({ progress: e.newValue === null ? emptyProgress() : fresh.progress });
    });
  }
  return store;
}

export const progressStore = createProgressStore(browserStorage());

export function useProgress<T>(selector: (s: ProgressState) => T): T {
  return useStore(progressStore, selector);
}
