/** Pure helpers behind `pnpm progress` (T-004): parse tasks.md, render the PROGRESS.md table. */

export type Marker = ' ' | '~' | 'x' | '!';
export type Owner = 'A' | 'B' | '?';

export interface Task {
  id: string;
  title: string;
  marker: Marker;
  owner: Owner;
  phase: number;
}

export interface Phase {
  number: number;
  name: string;
}

export interface ParsedTasks {
  phases: Phase[];
  tasks: Task[];
}

const PHASE = /^##\s+Phase\s+(\d+)\s+—\s+(.+?)\s*$/;
// - [x] **T-001 — Title** · **A** · deps: none
const TASK = /^-\s+\[([ ~x!])\]\s+(~~)?\*\*(T-\d+)\s+—\s+(.+?)\*\*(~~)?(?:\s+·\s+\*\*([AB])\*\*)?/;

/** "Core domain (pure TS)  — all Dev A" → "Core domain". */
export function phaseName(raw: string): string {
  return raw
    .replace(/\s+—\s+all Dev [AB]\s*$/i, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim();
}

export function parseTasks(markdown: string): ParsedTasks {
  const phases: Phase[] = [];
  const tasks: Task[] = [];
  let phase: number | undefined;

  for (const line of markdown.split(/\r?\n/)) {
    const p = PHASE.exec(line);
    if (p) {
      phase = Number(p[1]);
      phases.push({ number: phase, name: phaseName(p[2] as string) });
      continue;
    }
    const t = TASK.exec(line);
    if (!t || phase === undefined) continue;
    // Struck-through tasks (~~text~~) were retired, not done: ignore them in the counts.
    if (t[2] === '~~' || t[5] === '~~') continue;
    tasks.push({
      id: t[3] as string,
      title: t[4] as string,
      marker: t[1] as Marker,
      owner: (t[6] as Owner | undefined) ?? '?',
      phase,
    });
  }
  return { phases, tasks };
}

interface Counts {
  done: number;
  doing: number;
  blocked: number;
  todo: number;
  total: number;
}

function count(tasks: Task[]): Counts {
  const c: Counts = { done: 0, doing: 0, blocked: 0, todo: 0, total: tasks.length };
  for (const t of tasks) {
    if (t.marker === 'x') c.done++;
    else if (t.marker === '~') c.doing++;
    else if (t.marker === '!') c.blocked++;
    else c.todo++;
  }
  return c;
}

const pct = (c: Counts): string => `${c.total === 0 ? 0 : Math.floor((c.done / c.total) * 100)}%`;

export function renderSummary({ phases, tasks }: ParsedTasks): string {
  const rows = phases.map((ph) => {
    const c = count(tasks.filter((t) => t.phase === ph.number));
    return `| ${ph.number} ${ph.name} | ${c.done} | ${c.doing} | ${c.blocked} | ${c.todo} | ${c.total} | ${pct(c)} |`;
  });
  const all = count(tasks);
  const owners = (['A', 'B'] as const).map((o) => {
    const c = count(tasks.filter((t) => t.owner === o));
    return `| Dev ${o} | ${c.done} | ${c.doing} | ${c.blocked} | ${c.todo} | ${c.total} | ${pct(c)} |`;
  });
  return [
    '| Phase | Done | In progress | Blocked | Todo | Total | % |',
    '|---|---|---|---|---|---|---|',
    ...rows,
    `| **Total** | **${all.done}** | **${all.doing}** | **${all.blocked}** | **${all.todo}** | **${all.total}** | **${pct(all)}** |`,
    '',
    '| Owner | Done | In progress | Blocked | Todo | Total | % |',
    '|---|---|---|---|---|---|---|',
    ...owners,
  ].join('\n');
}

export const START = '<!-- PROGRESS:START -->';
export const END = '<!-- PROGRESS:END -->';

/** Replaces the text between the markers; throws if a marker is missing. */
export function replaceSummary(progressMd: string, summary: string): string {
  const a = progressMd.indexOf(START);
  const b = progressMd.indexOf(END);
  if (a < 0 || b < 0 || b < a) throw new Error(`PROGRESS.md must contain ${START} … ${END}`);
  return `${progressMd.slice(0, a + START.length)}\n${summary}\n${progressMd.slice(b)}`;
}
