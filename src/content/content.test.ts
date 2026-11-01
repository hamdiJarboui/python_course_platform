import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { compileContent } from './compile';
import { parseFence } from './fences';
import { loadContentFiles } from './node';
import { parseQuizYaml } from './quiz';
import { buildSearchIndex, loadSearchIndex, makeSnippet, runSearch } from './search';

const contentDir = fileURLToPath(new URL('../../content', import.meta.url));

describe('parseFence', () => {
  const p = (lang: string, meta = '') => parseFence(lang, meta, 'f.md', 3);

  it('treats unflagged python and other languages as plain', () => {
    expect(p('python')).toEqual({ kind: 'plain', lang: 'python' });
    expect(p('bash')).toEqual({ kind: 'plain', lang: 'bash' });
  });
  it('recognises output blocks', () => {
    expect(p('text', 'output')).toEqual({ kind: 'output' });
  });
  it('parses flags and meta', () => {
    expect(p('python', 'run title="hello.py" timeout=5')).toEqual({
      kind: 'python',
      flag: 'run',
      title: 'hello.py',
      timeoutMs: 5000,
    });
    expect(p('python', 'exercise id=ex-sum')).toMatchObject({ flag: 'exercise', id: 'ex-sum' });
  });
  it('rejects unknown flags with file and line', () => {
    expect(() => p('python', 'runn')).toThrowError(/unknown code fence option "runn"/);
    try {
      p('python', 'bogus');
    } catch (e) {
      expect(String(e)).toContain('f.md:3');
    }
  });
  it('rejects two flags, missing exercise id and bad timeouts', () => {
    expect(() => p('python', 'run edit')).toThrowError(/two flags/);
    expect(() => p('python', 'exercise')).toThrowError(/need an id/);
    expect(() => p('python', 'run id=x')).toThrowError(/only valid on exercise/);
    expect(() => p('python', 'run timeout=0')).toThrowError(/timeout/);
    expect(() => p('python', 'exercise id=Bad_Id')).toThrowError(/invalid id/);
  });
});

describe('parseQuizYaml', () => {
  const good = (n: number) =>
    Array.from({ length: n }, () => '- type: boolean\n  q: Is it?\n  answer: true\n  explain: Yes.').join('\n\n');

  it('parses a valid quiz', () => {
    expect(parseQuizYaml(good(5), 'q.md', 10)).toHaveLength(5);
  });
  it('reports the file line of an out-of-range answer', () => {
    const yaml = `${good(4)}\n\n- type: single\n  q: Pick\n  options: [a, b]\n  answer: 5\n  explain: no\n`;
    try {
      parseQuizYaml(yaml, 'q.md', 10);
      expect.unreachable();
    } catch (e) {
      const msg = String(e);
      expect(msg).toContain('q.md:');
      expect(msg).toContain('out of range');
      // fence opens on line 10; the bad `answer:` is the 24th line of the YAML body → file line 34.
      expect(msg).toContain('q.md:34');
    }
  });
  it('rejects too few questions, a missing explain and non-lists', () => {
    expect(() => parseQuizYaml(good(2), 'q.md', 1)).toThrowError(/at least 5/);
    expect(() => parseQuizYaml(`${good(4)}\n- type: boolean\n  q: x\n  answer: true\n`, 'q.md', 1)).toThrowError(
      /explain/,
    );
    expect(() => parseQuizYaml('a: 1', 'q.md', 1)).toThrowError(/list of questions/);
    expect(() => parseQuizYaml('- [unclosed', 'q.md', 1)).toThrowError(/invalid YAML/);
  });
});

// ---------------------------------------------------------- compileContent

const quizMd = (extra = '') => `---
type: quiz
title: Q
passScore: 70
---

\`\`\`quiz
${Array.from({ length: 5 }, () => '- type: boolean\n  q: x?\n  answer: true\n  explain: because.').join('\n')}
${extra}
\`\`\`
`;

const lesson = (body: string, fm = '') => `---
title: L
minutes: 3
objectives:
  - one
${fm}---

# L

${body}
`;

function tree(overrides: Record<string, string | undefined> = {}): Record<string, string> {
  const base: Record<string, string | undefined> = {
    'demo/course.yml': 'id: demo\ntitle: Demo\ndescription: d\nlevel: beginner\nversion: 1.0.0\n',
    'demo/01-m/module.yml': 'title: M\n',
    'demo/01-m/01-a.md': lesson('```python run\nprint(1)\n```'),
    'demo/01-m/99-quiz.md': quizMd(),
  };
  const merged = { ...base, ...overrides };
  return Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined)) as Record<string, string>;
}

describe('compileContent', () => {
  it('compiles a minimal course', async () => {
    const r = await compileContent(tree());
    expect(r.errors).toEqual([]);
    expect(r.manifest.courses[0]).toMatchObject({ id: 'demo', minutes: 3 });
    const mod = r.manifest.courses[0]?.modules[0];
    expect(mod?.id).toBe('demo/01-m');
    expect(mod?.lessons[0]).toMatchObject({ id: 'demo/01-m/01-a', hasRunnable: true });
    expect(mod?.quiz).toMatchObject({ id: 'demo/01-m/99-quiz', questionCount: 5 });
    expect(r.lessons['demo/01-m/01-a']?.blocks.map((b) => b.type)).toContain('cell');
  });

  it('fails when a module has no quiz', async () => {
    const r = await compileContent(tree({ 'demo/01-m/99-quiz.md': undefined }));
    expect(r.errors.map(String).join('\n')).toMatch(/no 99-quiz\.md/);
  });

  it('fails on an unknown fence flag, with file and line', async () => {
    const r = await compileContent(tree({ 'demo/01-m/01-a.md': lesson('```python runn\nx\n```') }));
    expect(r.errors[0]?.file).toBe('demo/01-m/01-a.md');
    expect(r.errors[0]?.line).toBeGreaterThan(1);
    expect(r.errors[0]?.message).toMatch(/unknown code fence option/);
  });

  it('fails on tests without an exercise, and an exercise without tests', async () => {
    const orphan = await compileContent(tree({ 'demo/01-m/01-a.md': lesson('```python run\n1\n```\n\n```python tests\nassert 1\n```') }));
    expect(orphan.errors[0]?.message).toMatch(/must directly follow/);
    const noTests = await compileContent(tree({ 'demo/01-m/01-a.md': lesson('```python exercise id=ex-a\npass\n```') }));
    expect(noTests.errors[0]?.message).toMatch(/must be followed by a "python tests"/);
  });

  it('fails on duplicate exercise ids within a course', async () => {
    const ex = '```python exercise id=ex-a\npass\n```\n\n```python tests\nassert 1\n```';
    const r = await compileContent(
      tree({ 'demo/01-m/01-a.md': lesson(ex), 'demo/01-m/02-b.md': lesson(ex) }),
    );
    expect(r.errors.map(String).join('\n')).toMatch(/duplicate exercise id "ex-a"/);
  });

  it('requires a runnable block unless concept: true', async () => {
    const r = await compileContent(tree({ 'demo/01-m/01-a.md': lesson('Just text.') }));
    expect(r.errors[0]?.message).toMatch(/at least one runnable block/);
    const ok = await compileContent(tree({ 'demo/01-m/01-a.md': lesson('Just text.', 'concept: true\n') }));
    expect(ok.errors).toEqual([]);
  });

  it('fails on broken internal links and images without alt', async () => {
    const link = await compileContent(
      tree({ 'demo/01-m/01-a.md': lesson('```python run\n1\n```\n\n[x](missing.md)') }),
    );
    expect(link.errors[0]?.message).toMatch(/broken link/);
    const img = await compileContent(
      tree({ 'demo/01-m/01-a.md': lesson('```python run\n1\n```\n\n![](assets/a.png)') }),
    );
    expect(img.errors[0]?.message).toMatch(/alt text/);
  });

  it('resolves relative links between lessons and to the quiz', async () => {
    const r = await compileContent(
      tree({
        'demo/01-m/01-a.md': lesson('```python run\n1\n```\n\n[b](02-b.md#top) [q](99-quiz.md)'),
        'demo/01-m/02-b.md': lesson('```python run\n1\n```'),
      }),
    );
    expect(r.errors).toEqual([]);
    const html = (r.lessons['demo/01-m/01-a']?.blocks.at(-1) as { html: string }).html;
    expect(html).toContain('href="/c/demo/01-m/02-b#top"');
    expect(html).toContain('href="/c/demo/01-m/quiz"');
  });

  it('rejects a mismatched course folder, reserved lesson 99 and stray markdown names', async () => {
    const id = await compileContent(tree({ 'demo/course.yml': 'id: other\ntitle: T\ndescription: d\nlevel: beginner\nversion: 1.0.0\n' }));
    expect(id.errors[0]?.message).toMatch(/must equal the folder name/);
    const r99 = await compileContent(tree({ 'demo/01-m/99-extra.md': lesson('```python run\n1\n```') }));
    expect(r99.errors.map(String).join('\n')).toMatch(/reserved for the module quiz/);
    const stray = await compileContent(tree({ 'demo/01-m/notes.md': 'x' }));
    expect(stray.errors[0]?.message).toMatch(/NN-slug\.md/);
  });

  it('reports invalid frontmatter with a line number', async () => {
    const r = await compileContent(tree({ 'demo/01-m/01-a.md': '---\ntitle: L\nminutes: abc\nobjectives: [x]\n---\n\n```python run\n1\n```\n' }));
    expect(r.errors[0]?.line).toBe(3);
    expect(r.errors[0]?.message).toMatch(/minutes/);
  });

  it('renders callouts, math and syntax highlighting', async () => {
    const body = '> [!WARNING] Careful\n\nInline $x^2$.\n\n```python\nprint("hi")\n```\n\n```python run\n1\n```';
    const r = await compileContent(tree({ 'demo/01-m/01-a.md': lesson(body) }));
    expect(r.errors).toEqual([]);
    const html = (r.lessons['demo/01-m/01-a']?.blocks[0] as { html: string }).html;
    expect(html).toContain('callout callout-warning');
    expect(html).toContain('class="katex"');
    expect(html).toContain('shiki');
  });

  it('rejects unknown callout types', async () => {
    const r = await compileContent(tree({ 'demo/01-m/01-a.md': lesson('> [!DANGER] x\n\n```python run\n1\n```') }));
    expect(r.errors[0]?.message).toMatch(/unknown callout/);
  });

  it('hides fixture courses unless asked', async () => {
    const files = Object.fromEntries(
      Object.entries(tree()).map(([k, v]) => [`__fixtures__/${k}`, v]),
    );
    const hidden = await compileContent(files);
    expect(hidden.errors).toEqual([]);
    expect(hidden.manifest.courses).toEqual([]);
    expect((await compileContent(files, { includeFixtures: true })).manifest.courses).toHaveLength(1);
  });
});

describe('real course content', () => {
  it('builds with zero errors and matches the documented shape', async () => {
    const files = await loadContentFiles(contentDir);
    const r = await compileContent(files, { includeFixtures: true });
    expect(r.errors.map(String)).toEqual([]);
    const ids = r.manifest.courses.map((c) => c.id).sort();
    expect(ids).toEqual([
      'demo',
      'python-basics',
      'python-files-data',
      'python-intermediate',
      'python-testing-debugging',
    ]);
    const basics = r.manifest.courses.find((c) => c.id === 'python-basics');
    expect(basics?.modules).toHaveLength(3);
    for (const mod of basics?.modules ?? []) {
      expect(mod.lessons.length).toBeGreaterThanOrEqual(4);
      expect(mod.quiz.questionCount).toBeGreaterThanOrEqual(6);
    }
    const inter = r.manifest.courses.find((c) => c.id === 'python-intermediate');
    expect(inter?.gating).toBe('quiz');
    expect(inter?.modules.length).toBeGreaterThanOrEqual(3);
  });
});

describe('search', () => {
  const docs = [
    { id: 'a', title: 'for Loops', headings: 'range enumerate', text: 'Loop over a sequence with for and range.', route: '/c/a', courseTitle: 'C', moduleTitle: 'M' },
    { id: 'b', title: 'Strings', headings: 'slicing', text: 'Text values, slicing and formatting with f-strings.', route: '/c/b', courseTitle: 'C', moduleTitle: 'M' },
  ];
  it('finds by prefix, ranks title matches and builds snippets', () => {
    const idx = loadSearchIndex(buildSearchIndex(docs).toJSON());
    const hits = runSearch(idx, 'loo');
    expect(hits[0]).toMatchObject({ id: 'a', route: '/c/a' });
    expect(hits[0]?.snippet.toLowerCase()).toContain('loop');
    expect(runSearch(idx, 'slicing')[0]?.id).toBe('b');
    expect(runSearch(idx, '   ')).toEqual([]);
    expect(runSearch(idx, 'zzzzqqq')).toEqual([]);
  });
  it('makeSnippet adds ellipses around a mid-text match', () => {
    const s = makeSnippet(`${'x'.repeat(100)} needle ${'y'.repeat(200)}`, ['needle']);
    expect(s.startsWith('…')).toBe(true);
    expect(s.endsWith('…')).toBe(true);
    expect(s).toContain('needle');
  });
});
