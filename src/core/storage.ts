import { z } from 'zod';
import { PROGRESS_VERSION, emptyProgress } from './progress';
import type { ProgressV1 } from './types';

export const PROGRESS_KEY = 'pycourses:progress:v1';

/** The subset of `Storage` we need — lets tests inject a fake and the app fall back to memory. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
}

const courseProgressSchema = z.object({
  lessons: z.record(z.string(), z.object({ completedAt: z.string() })),
  quizzes: z.record(
    z.string(),
    z.object({
      best: z.number(),
      attempts: z.number(),
      passed: z.boolean(),
      lastAt: z.string(),
    }),
  ),
  exercises: z.record(z.string(), z.object({ passed: z.boolean(), at: z.string() })),
  last: z.string().optional(),
});

export const progressV1Schema = z.object({
  version: z.literal(1),
  courses: z.record(z.string(), courseProgressSchema),
});

/** Each entry upgrades data from version `index` to `index + 1`. */
type Migration = (data: Record<string, unknown>) => Record<string, unknown>;
const MIGRATIONS: Migration[] = [
  // v0 → v1: early prototypes stored `{ courses }` without a version field.
  (data) => ({ ...data, version: 1 }),
];

export type LoadStatus = 'ok' | 'empty' | 'migrated' | 'recovered';
export interface LoadResult {
  progress: ProgressV1;
  status: LoadStatus;
  /** Human-readable explanation for the UI banner, if any. */
  message?: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Upgrades arbitrary parsed JSON to the current schema, or returns `undefined` if impossible. */
export function migrateProgress(raw: unknown): { progress: ProgressV1; migrated: boolean } | undefined {
  if (!isRecord(raw)) return undefined;
  let data: Record<string, unknown> = raw;
  const startVersion = typeof data['version'] === 'number' ? data['version'] : 0;
  if (startVersion > PROGRESS_VERSION) return undefined; // written by a newer app
  for (let v = startVersion; v < PROGRESS_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (!step) return undefined;
    data = step(data);
  }
  const parsed = progressV1Schema.safeParse(data);
  if (!parsed.success) return undefined;
  return { progress: parsed.data, migrated: startVersion < PROGRESS_VERSION };
}

export interface ProgressStorage {
  load(): LoadResult;
  save(progress: ProgressV1): void;
  clear(): void;
  exportJson(progress: ProgressV1): string;
  importJson(text: string): { ok: true; progress: ProgressV1 } | { ok: false; error: string };
  /** True when we had to fall back to memory because localStorage is unusable. */
  readonly persistent: boolean;
}

function probe(store: KeyValueStore): boolean {
  try {
    const k = '__pycourses_probe__';
    store.setItem(k, '1');
    store.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function createProgressStorage(
  kv: KeyValueStore | null,
  key: string = PROGRESS_KEY,
  now: () => Date = () => new Date(),
): ProgressStorage {
  const usable = kv !== null && probe(kv);
  const store: KeyValueStore = usable && kv ? kv : new MemoryStore();

  return {
    persistent: usable,

    load() {
      let text: string | null;
      try {
        text = store.getItem(key);
      } catch {
        return { progress: emptyProgress(), status: 'empty' };
      }
      if (text === null) return { progress: emptyProgress(), status: 'empty' };

      let raw: unknown;
      try {
        raw = JSON.parse(text);
      } catch {
        raw = undefined;
      }
      const result = raw === undefined ? undefined : migrateProgress(raw);
      if (result) {
        if (result.migrated) {
          try {
            store.setItem(key, JSON.stringify(result.progress));
          } catch {
            /* keep going with the in-memory copy */
          }
        }
        return { progress: result.progress, status: result.migrated ? 'migrated' : 'ok' };
      }

      // Corrupted or from the future: keep a backup, then start fresh.
      const backupKey = `${key}:backup:${now().getTime()}`;
      try {
        store.setItem(backupKey, text);
        store.removeItem(key);
      } catch {
        /* nothing more we can do */
      }
      return {
        progress: emptyProgress(),
        status: 'recovered',
        message: `Your saved progress could not be read. A backup was kept under "${backupKey}" and progress was reset.`,
      };
    },

    save(progress) {
      try {
        store.setItem(key, JSON.stringify(progress));
      } catch {
        // Quota or privacy mode: the in-session state still works.
      }
    },

    clear() {
      try {
        store.removeItem(key);
      } catch {
        /* ignore */
      }
    },

    exportJson(progress) {
      return JSON.stringify({ ...progress, exportedAt: now().toISOString() }, null, 2);
    },

    importJson(text) {
      let raw: unknown;
      try {
        raw = JSON.parse(text);
      } catch {
        return { ok: false, error: 'The file is not valid JSON.' };
      }
      if (isRecord(raw)) delete raw['exportedAt'];
      const result = migrateProgress(raw);
      if (!result) return { ok: false, error: 'The file is not a valid PyCourses progress export.' };
      return { ok: true, progress: result.progress };
    },
  };
}

/** Browser entry: tolerates `localStorage` access itself throwing (blocked cookies). */
export function browserStorage(): ProgressStorage {
  let kv: KeyValueStore | null;
  try {
    kv = typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    kv = null;
  }
  return createProgressStorage(kv);
}
