import { create } from 'zustand';
import type { ProgressState, QuizAttempt } from '../types';
import { loadProgress, saveProgress } from '../lib/storage';
import { getModule, getQuiz } from '../lib/content';

interface ProgressActions { visitLesson: (id: string) => void; completeLesson: (id: string) => void; saveAttempt: (attempt: QuizAttempt) => void; importProgress: (progress: ProgressState) => void; getCode: (lessonId: string, blockId: string, original: string) => string; saveCode: (lessonId: string, blockId: string, code: string) => void; }
const initial = loadProgress('python-101');
const persist = (next: ProgressState) => {
  try { saveProgress(next); return { ...next, storageError: undefined }; }
  catch (error) { return { ...next, storageError: error instanceof Error ? error.message : 'Progress could not be saved.' }; }
};
export const useProgress = create<ProgressState & ProgressActions>((set, get) => ({
  ...initial,
  visitLesson: (id) => set((state) => persist({ ...state, lastVisitedLessonId: id, lessons: { ...state.lessons, [id]: { ...(state.lessons[id] ?? { completed: false, lastVisitedAt: '' }), lastVisitedAt: new Date().toISOString() } } })),
  completeLesson: (id) => set((state) => persist({ ...state, lessons: { ...state.lessons, [id]: { ...(state.lessons[id] ?? { lastVisitedAt: new Date().toISOString() }), completed: true, completedAt: new Date().toISOString() } } })),
  saveAttempt: (attempt) => set((state) => { const module = getModule(attempt.moduleId); const quiz = getQuiz(attempt.moduleId); const attempts = [...(state.modules[attempt.moduleId]?.quizAttempts ?? []), attempt]; const lessonsDone = module?.lessons.every((lesson) => state.lessons[lesson.id]?.completed) ?? false; return persist({ ...state, modules: { ...state.modules, [attempt.moduleId]: { quizAttempts: attempts, completed: lessonsDone && attempt.score >= (quiz?.passScore ?? 70), completedAt: lessonsDone && attempt.passed ? new Date().toISOString() : undefined } } }); }),
  importProgress: (progress) => set(() => persist(progress)),
  getCode: (lessonId, blockId, original) => get().lessons[lessonId]?.codeEdits?.[blockId] ?? original,
  saveCode: (lessonId, blockId, code) => set((state) => { const current = state.lessons[lessonId] ?? { completed: false, lastVisitedAt: new Date().toISOString() }; return persist({ ...state, lessons: { ...state.lessons, [lessonId]: { ...current, codeEdits: { ...current.codeEdits, [blockId]: code } } } }); })
}));
