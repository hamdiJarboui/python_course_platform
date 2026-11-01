import { describe, expect, it } from 'vitest';
import { MemoryStore, PROGRESS_KEY, createProgressStorage } from '@/core/storage';
import { createProgressStore } from './progress';

function setup(initial?: string) {
  const kv = new MemoryStore();
  if (initial !== undefined) kv.setItem(PROGRESS_KEY, initial);
  const storage = createProgressStorage(kv);
  return { kv, store: createProgressStore(storage) };
}

describe('progress store', () => {
  it('persists every change through the storage adapter', () => {
    const { kv, store } = setup();
    store.getState().completeLesson('c', 'c/m/l1');
    store.getState().recordQuiz('c', 'c/m/99-quiz', { score: 90, passed: true });
    store.getState().recordExercise('c', 'ex-1', true);
    store.getState().setLast('c', 'c/m/l1');
    const saved = JSON.parse(kv.getItem(PROGRESS_KEY) ?? '{}');
    expect(saved.courses.c.lessons['c/m/l1']).toBeDefined();
    expect(saved.courses.c.quizzes['c/m/99-quiz']).toMatchObject({ best: 90, passed: true, attempts: 1 });
    expect(saved.courses.c.exercises['ex-1'].passed).toBe(true);
    expect(saved.courses.c.last).toBe('c/m/l1');
  });

  it('loads previously saved progress', () => {
    const first = setup();
    first.store.getState().completeLesson('c', 'c/m/l1');
    const again = setup(first.kv.getItem(PROGRESS_KEY) ?? '');
    expect(again.store.getState().progress.courses['c']?.lessons['c/m/l1']).toBeDefined();
  });

  it('does not write when nothing changed', () => {
    const { kv, store } = setup();
    store.getState().completeLesson('c', 'c/m/l1');
    const before = kv.getItem(PROGRESS_KEY);
    store.getState().completeLesson('c', 'c/m/l1');
    expect(kv.getItem(PROGRESS_KEY)).toBe(before);
  });

  it('surfaces a notice when stored data was corrupted, and can dismiss it', () => {
    const { store } = setup('{oops');
    expect(store.getState().loadStatus).toBe('recovered');
    expect(store.getState().notice).toContain('backup');
    store.getState().dismissNotice();
    expect(store.getState().notice).toBeUndefined();
  });

  it('imports valid JSON, rejects invalid JSON and resets a course', () => {
    const { store } = setup();
    store.getState().completeLesson('c', 'c/m/l1');
    const exported = store.getState().exportJson();
    store.getState().resetCourse('c');
    expect(store.getState().progress.courses).toEqual({});
    expect(store.getState().importJson(exported)).toEqual({ ok: true });
    expect(store.getState().progress.courses['c']?.lessons['c/m/l1']).toBeDefined();
    expect(store.getState().importJson('nope')).toMatchObject({ ok: false });
  });
});
