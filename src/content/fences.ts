import { ContentError } from './errors';

export const PYTHON_FLAGS = ['run', 'edit', 'exercise', 'tests', 'solution', 'setup'] as const;
export type PythonFlag = (typeof PYTHON_FLAGS)[number];

export const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_TIMEOUT_S = 120;

export type FenceInfo =
  | { kind: 'plain'; lang: string | undefined }
  | { kind: 'output' }
  | {
      kind: 'python';
      flag: PythonFlag;
      id?: string;
      title?: string;
      timeoutMs: number;
    };

const TOKEN = /([A-Za-z][\w-]*)(?:=(?:"([^"]*)"|(\S+)))?/g;
const EXERCISE_ID = /^[a-z0-9][a-z0-9-]*$/;

function tokens(meta: string): { key: string; value?: string }[] {
  const out: { key: string; value?: string }[] = [];
  for (const m of meta.matchAll(TOKEN)) {
    const value = m[2] ?? m[3];
    out.push(value === undefined ? { key: m[1] as string } : { key: m[1] as string, value });
  }
  return out;
}

/**
 * Interprets a code fence's `lang` and `meta`.
 * Only ```python fences carry behaviour flags; `text output` is a static expected-output block.
 */
export function parseFence(
  lang: string | null | undefined,
  meta: string | null | undefined,
  file: string,
  line: number | undefined,
): FenceInfo {
  const l = lang ?? undefined;
  if (l === 'text' && (meta ?? '').trim() === 'output') return { kind: 'output' };
  if (l !== 'python' && l !== 'py') return { kind: 'plain', lang: l };

  const toks = tokens(meta ?? '');
  let flag: PythonFlag | undefined;
  let id: string | undefined;
  let title: string | undefined;
  let timeoutMs = DEFAULT_TIMEOUT_MS;

  for (const { key, value } of toks) {
    if ((PYTHON_FLAGS as readonly string[]).includes(key) && value === undefined) {
      if (flag) {
        throw new ContentError(file, line, `code fence has two flags ("${flag}" and "${key}"); use only one`);
      }
      flag = key as PythonFlag;
    } else if (key === 'id' && value !== undefined) {
      if (!EXERCISE_ID.test(value)) {
        throw new ContentError(file, line, `invalid id "${value}": use lowercase letters, digits and dashes`);
      }
      id = value;
    } else if (key === 'title' && value !== undefined) {
      title = value;
    } else if (key === 'timeout' && value !== undefined) {
      const s = Number(value);
      if (!Number.isFinite(s) || s <= 0 || s > MAX_TIMEOUT_S) {
        throw new ContentError(file, line, `timeout must be 1..${MAX_TIMEOUT_S} seconds, got "${value}"`);
      }
      timeoutMs = Math.round(s * 1000);
    } else {
      throw new ContentError(
        file,
        line,
        `unknown code fence option "${key}"; allowed flags: ${PYTHON_FLAGS.join(', ')}; options: id, title, timeout`,
      );
    }
  }

  if (!flag) {
    if (id !== undefined) {
      throw new ContentError(file, line, 'id= is only valid on exercise fences');
    }
    return { kind: 'plain', lang: 'python' };
  }
  if (flag === 'exercise' && id === undefined) {
    throw new ContentError(file, line, 'exercise fences need an id, e.g. ```python exercise id=ex-sum');
  }
  if (id !== undefined && flag !== 'exercise') {
    throw new ContentError(file, line, 'id= is only valid on exercise fences');
  }
  return { kind: 'python', flag, ...(id !== undefined && { id }), ...(title !== undefined && { title }), timeoutMs };
}
