import { describe, expect, it } from 'vitest';
import { completeLesson, emptyProgress } from './progress';
import { MemoryStore, PROGRESS_KEY, createProgressStorage, migrateProgress } from './storage';
import type { KeyValueStore } from './storage';

const NOW = () => new Date('2026-01-01T00:00:00Z');

describe('progress storage', () => {
  it('returns empty progress when nothing is stored', () => {
    const s = createProgressStorage(new MemoryStore(), PROGRESS_KEY, NOW);
    expect(s.load()).toEqual({ progress: emptyProgress(), status: 'empty' });
    expect(s.persistent).toBe(true);
  });

  it('round-trips saved progress', () => {
    const kv = new MemoryStore();
    const s = createProgressStorage(kv, PROGRESS_KEY, NOW);
    const p = completeLesson(emptyProgress(), 'c', 'c/m/l', NOW());
    s.save(p);
    expect(createProgressStorage(kv).load()).toEqual({ progress: p, status: 'ok' });
  });

  it('migrates an unversioned (v0) payload and rewrites it', () => {
    const kv = new MemoryStore();
    kv.setItem(PROGRESS_KEY, JSON.stringify({ courses: {} }));
    const r = createProgressStorage(kv, PROGRESS_KEY, NOW).load();
    expect(r.status).toBe('migrated');
    expect(JSON.parse(kv.getItem(PROGRESS_KEY) ?? '{}')).toMatchObject({ version: 1 });
  });

  it('backs up and resets corrupted JSON', () => {
    const kv = new MemoryStore();
    kv.setItem(PROGRESS_KEY, '{not json');
    const r = createProgressStorage(kv, PROGRESS_KEY, NOW).load();
    expect(r.status).toBe('recovered');
    expect(r.progress).toEqual(emptyProgress());
    expect(r.message).toContain('backup');
    expect(kv.getItem(PROGRESS_KEY)).toBeNull();
    expect(kv.getItem(`${PROGRESS_KEY}:backup:${NOW().getTime()}`)).toBe('{not json');
  });

  it('treats schema-invalid or future-version data as corrupted', () => {
    expect(migrateProgress({ version: 1, courses: { c: { lessons: 3 } } })).toBeUndefined();
    expect(migrateProgress({ version: 99, courses: {} })).toBeUndefined();
    expect(migrateProgress([])).toBeUndefined();
  });

  it('falls back to memory when storage throws', () => {
    const broken: KeyValueStore = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    };
    const s = createProgressStorage(broken);
    expect(s.persistent).toBe(false);
    expect(s.load().status).toBe('empty');
    expect(() => s.save(emptyProgress())).not.toThrow();
  });

  it('falls back to memory when no storage exists', () => {
    expect(createProgressStorage(null).persistent).toBe(false);
  });

  it('survives quota errors on save', () => {
    const kv = new MemoryStore();
    const s = createProgressStorage(kv);
    kv.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    expect(() => s.save(emptyProgress())).not.toThrow();
  });

  it('exports and imports JSON, validating input', () => {
    const s = createProgressStorage(new MemoryStore(), PROGRESS_KEY, NOW);
    const p = completeLesson(emptyProgress(), 'c', 'c/m/l', NOW());
    const text = s.exportJson(p);
    expect(JSON.parse(text).exportedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(s.importJson(text)).toEqual({ ok: true, progress: p });
    expect(s.importJson('nope')).toMatchObject({ ok: false });
    expect(s.importJson('{"hello": 1}')).toMatchObject({ ok: false });
  });
});
