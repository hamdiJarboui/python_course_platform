import type { ProgressState } from '../types';
export const STORAGE_KEY = 'pycourse:progress';
export class StorageError extends Error { constructor(message: string) { super(message); this.name = 'StorageError'; } }
export const emptyProgress = (courseId: string): ProgressState => ({ version: 1, courseId, lessons: {}, modules: {} });
export function loadProgress(courseId: string): ProgressState {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return emptyProgress(courseId); const parsed = JSON.parse(raw) as ProgressState; return parsed.courseId === courseId ? parsed : emptyProgress(courseId); }
  catch { return emptyProgress(courseId); }
}
export function saveProgress(progress: ProgressState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
  catch { throw new StorageError('Progress could not be saved. Export a backup before continuing.'); }
}
export function serializeProgress(progress: ProgressState) { return JSON.stringify(progress, null, 2); }
export function parseProgress(raw: string, courseId: string): ProgressState {
  const parsed = JSON.parse(raw) as ProgressState;
  if (parsed.version !== 1 || parsed.courseId !== courseId || !parsed.lessons || !parsed.modules) throw new Error('This progress file is not compatible with this course version.');
  return parsed;
}
