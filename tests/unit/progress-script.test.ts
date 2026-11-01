import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { END, START, parseTasks, phaseName, renderSummary, replaceSummary } from '../../scripts/progress-lib';

const sample = `# tasks
## Phase 0 — Foundation
- [x] **T-001 — Scaffold project** · **A** · deps: none
- [~] **T-002 — Lint** · **B** · deps: T-001
- [ ] **T-003 — Tests** · **A**
- [!] **T-004 — Blocked thing** · **B**
## Phase 1 — Core domain (pure TS)  — all Dev A
- [x] **T-010 — Types** · **A**
- [x] ~~**T-011 — Retired**~~ · **A**
`;

describe('parseTasks', () => {
  const parsed = parseTasks(sample);
  it('reads phases and strips decorations from names', () => {
    expect(parsed.phases).toEqual([
      { number: 0, name: 'Foundation' },
      { number: 1, name: 'Core domain' },
    ]);
    expect(phaseName('PDF export  — all Dev B')).toBe('PDF export');
  });
  it('ignores the owner tag in titles and records markers', () => {
    expect(parsed.tasks.map((t) => [t.id, t.marker, t.owner, t.title])).toEqual([
      ['T-001', 'x', 'A', 'Scaffold project'],
      ['T-002', '~', 'B', 'Lint'],
      ['T-003', ' ', 'A', 'Tests'],
      ['T-004', '!', 'B', 'Blocked thing'],
      ['T-010', 'x', 'A', 'Types'],
    ]);
  });
  it('skips struck-through (retired) tasks', () => {
    expect(parsed.tasks.find((t) => t.id === 'T-011')).toBeUndefined();
  });
});

describe('renderSummary / replaceSummary', () => {
  it('counts per phase, total and per owner', () => {
    const out = renderSummary(parseTasks(sample));
    expect(out).toContain('| 0 Foundation | 1 | 1 | 1 | 1 | 4 | 25% |');
    expect(out).toContain('| 1 Core domain | 1 | 0 | 0 | 0 | 1 | 100% |');
    expect(out).toContain('| **Total** | **2** | **1** | **1** | **1** | **5** | **40%** |');
    expect(out).toContain('| Dev A | 2 | 0 | 0 | 1 | 3 | 66% |');
    expect(out).toContain('| Dev B | 0 | 1 | 1 | 0 | 2 | 0% |');
  });

  it('rewrites only the text between the markers, idempotently', () => {
    const md = `intro\n${START}\nold\n${END}\noutro\n`;
    const once = replaceSummary(md, 'NEW');
    expect(once).toBe(`intro\n${START}\nNEW\n${END}\noutro\n`);
    expect(replaceSummary(once, 'NEW')).toBe(once);
  });

  it('fails loudly when markers are missing', () => {
    expect(() => replaceSummary('no markers', 'x')).toThrowError(/PROGRESS:START/);
  });

  it('parses the real tasks.md without losing tasks', () => {
    const real = readFileSync(fileURLToPath(new URL('../../tasks.md', import.meta.url)), 'utf8');
    const parsed = parseTasks(real);
    const ids = new Set(parsed.tasks.map((t) => t.id));
    expect(ids.size).toBe(parsed.tasks.length);
    expect(parsed.tasks.every((t) => t.owner === 'A' || t.owner === 'B')).toBe(true);
    expect(real.match(/\*\*T-\d+ —/g)?.length).toBe(parsed.tasks.length);
  });
});
