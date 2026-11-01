import rehypeShiki from '@shikijs/rehype';
import GithubSlugger from 'github-slugger';
import type { Root as HastRoot } from 'hast';
import type { Blockquote, Code, Heading as MdHeading, Image, Link, Paragraph, Root, RootContent } from 'mdast';
import { toString as mdToString } from 'mdast-util-to-string';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { parseDocument } from 'yaml';
import type { ZodType } from 'zod';
import type { CodeCellData, ExerciseData, Heading, LessonBlock } from '@/core/types';
import { ContentError } from './errors';
import { parseFence } from './fences';

// ----------------------------------------------------------------- callouts

export const CALLOUT_TYPES = ['NOTE', 'TIP', 'WARNING', 'PYTHONIC'] as const;
const CALLOUT_LABEL: Record<(typeof CALLOUT_TYPES)[number], string> = {
  NOTE: 'Note',
  TIP: 'Tip',
  WARNING: 'Warning',
  PYTHONIC: 'Pythonic',
};
const CALLOUT_MARKER = /^\[!([A-Za-z]+)\][ \t]*\r?\n?/;

interface CalloutOptions {
  /** Read lazily: one shared processor serves every file (Shiki start-up is expensive). */
  getFile: () => string;
}

/** `> [!NOTE] text` → `<div class="callout callout-note">` with a title row. */
const remarkCallouts: Plugin<[CalloutOptions], Root> = ({ getFile }) => {
  return (tree) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      const first = node.children[0];
      if (first?.type !== 'paragraph') return;
      const text = first.children[0];
      if (text?.type !== 'text') return;
      const m = CALLOUT_MARKER.exec(text.value);
      if (!m) return;
      const kind = (m[1] ?? '').toUpperCase() as (typeof CALLOUT_TYPES)[number];
      if (!CALLOUT_TYPES.includes(kind)) {
        throw new ContentError(
          getFile(),
          node.position?.start.line,
          `unknown callout [!${m[1] ?? ''}]; use one of ${CALLOUT_TYPES.map((t) => `[!${t}]`).join(', ')}`,
        );
      }
      text.value = text.value.slice(m[0].length);
      if (text.value === '') first.children.shift();
      if (first.children.length === 0) node.children.shift();

      const title: Paragraph = {
        type: 'paragraph',
        children: [{ type: 'text', value: CALLOUT_LABEL[kind] }],
        data: { hName: 'p', hProperties: { className: ['callout-title'] } },
      };
      node.children.unshift(title);
      node.data = {
        hName: 'div',
        hProperties: {
          className: ['callout', `callout-${kind.toLowerCase()}`],
          'data-callout': kind.toLowerCase(),
          role: 'note',
        },
      };
    });
  };
};

// ---------------------------------------------------------------- rendering

type Renderer = ReturnType<typeof createRenderer>;

let currentFile = '';

function createRenderer() {
  return unified()
    .use(remarkCallouts, { getFile: () => currentFile })
    .use(remarkRehype)
    .use(rehypeAutolinkHeadings, {
      behavior: 'append',
      properties: { className: ['anchor'], ariaLabel: 'Link to this section' },
      content: { type: 'text', value: '#' },
    })
    .use(rehypeKatex)
    .use(rehypeShiki, {
      themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' },
      defaultColor: false,
      fallbackLanguage: 'text',
    })
    .use(rehypeStringify);
}

let sharedRenderer: Renderer | undefined;
function renderer(file: string): Renderer {
  sharedRenderer ??= createRenderer();
  currentFile = file;
  return sharedRenderer;
}

async function renderGroup(children: RootContent[], file: string): Promise<string> {
  const r = renderer(file);
  const hast = (await r.run({ type: 'root', children } satisfies Root)) as HastRoot;
  return String(r.stringify(hast));
}

/** A static "Expected output" block, built without raw HTML so authored HTML stays disabled. */
function expectedOutputNode(value: string): Paragraph {
  const text = (v: string): { type: 'text'; value: string } => ({ type: 'text', value: v });
  const el = (tagName: string, children: unknown[]): unknown => ({
    type: 'element',
    tagName,
    properties: {},
    children,
  });
  return {
    type: 'paragraph',
    children: [],
    data: {
      hName: 'figure',
      hProperties: { className: ['expected-output'] },
      hChildren: [
        el('figcaption', [text('Expected output')]),
        el('pre', [el('code', [text(value)])]),
      ],
    } as Paragraph['data'],
  };
}

/** Highlights a Python snippet to a Shiki `<pre>` (same output as a plain ```python fence). */
async function highlightPython(code: string, file: string): Promise<string> {
  return renderGroup([{ type: 'code', lang: 'python', value: code }], file);
}

const parser = unified().use(remarkParse).use(remarkFrontmatter, ['yaml']).use(remarkGfm).use(remarkMath);

export function parseMarkdown(source: string): Root {
  return parser.parse(source);
}

// -------------------------------------------------------------- frontmatter

export function readFrontmatter<T>(
  tree: Root,
  schema: ZodType<T>,
  file: string,
): { data: T; body: RootContent[] } {
  const first = tree.children[0];
  if (first?.type !== 'yaml') {
    throw new ContentError(file, 1, 'missing YAML frontmatter (--- ... ---) at the top of the file');
  }
  const doc = parseDocument(first.value);
  const baseLine = (first.position?.start.line ?? 1) + 1;
  if (doc.errors[0]) {
    throw new ContentError(file, baseLine, `invalid frontmatter YAML: ${doc.errors[0].message.split('\n')[0]}`);
  }
  const parsed = schema.safeParse(doc.toJS());
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const key = issue?.path[0];
    const node = key === undefined ? undefined : (doc.getIn([key], true) as { range?: [number] } | undefined);
    const offset = node?.range?.[0] ?? 0;
    const line = baseLine + first.value.slice(0, offset).split('\n').length - 1;
    const where = issue?.path.length ? `"${issue.path.join('.')}": ` : '';
    throw new ContentError(file, line, `frontmatter ${where}${issue?.message ?? 'invalid'}`);
  }
  return { data: parsed.data, body: tree.children.slice(1) };
}

// -------------------------------------------------------------------- lessons

export interface LessonCompileContext {
  file: string;
  /** Maps a relative `.md` link to a route path, or `undefined` when the target does not exist. */
  resolveLink(href: string): string | undefined;
  /** URL prefix where a course's assets are served, e.g. "/course-assets/python-basics/". */
  assetBase: string;
}

export interface CompiledBody {
  /** 1-based source line of each cell / exercise fence, by cell id / exercise id (for content:verify). */
  lines: Record<string, number>;
  /** Text of a `text output` block that directly follows a cell, by cell id. */
  expected: Record<string, string>;
  blocks: LessonBlock[];
  headings: Heading[];
  setup: string;
  hasRunnable: boolean;
  exerciseIds: string[];
  /** Plain text used for the search index. */
  text: string;
}

const EXTERNAL = /^[a-z][a-z0-9+.-]*:/i;

function processHeadings(body: RootContent[]): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  const root: Root = { type: 'root', children: body };
  visit(root, 'heading', (node: MdHeading) => {
    const text = mdToString(node);
    const id = slugger.slug(text);
    node.data = { ...node.data, hProperties: { ...(node.data as { hProperties?: object } | undefined)?.hProperties, id } };
    headings.push({ id, text, depth: node.depth });
  });
  return headings;
}

function processLinksAndImages(body: RootContent[], ctx: LessonCompileContext): void {
  const root: Root = { type: 'root', children: body };
  visit(root, 'link', (node: Link) => {
    const url = node.url;
    if (EXTERNAL.test(url) || url.startsWith('#')) return;
    const line = node.position?.start.line;
    const [path = '', hash] = url.split('#');
    if (path.endsWith('.md')) {
      const route = ctx.resolveLink(path);
      if (!route) throw new ContentError(ctx.file, line, `broken link: "${url}" does not match any lesson`);
      node.url = hash ? `${route}#${hash}` : route;
      node.data = { ...node.data, hProperties: { 'data-internal': 'true' } };
    } else if (path.startsWith('/c/')) {
      node.data = { ...node.data, hProperties: { 'data-internal': 'true' } };
    } else {
      throw new ContentError(ctx.file, line, `unsupported link "${url}": use a full URL, #anchor, or a relative .md path`);
    }
  });
  visit(root, 'image', (node: Image) => {
    if (!node.alt || node.alt.trim() === '') {
      throw new ContentError(ctx.file, node.position?.start.line, `image "${node.url}" needs alt text`);
    }
    if (!EXTERNAL.test(node.url)) {
      node.url = ctx.assetBase + node.url.replace(/^\.?\/?assets\//, '');
    }
  });
}

function exerciseOrphan(flag: string, file: string, line: number | undefined): ContentError {
  return new ContentError(file, line, `a "${flag}" fence must directly follow a "python exercise" fence`);
}

/** Splits a lesson body into prose (rendered to HTML), runnable cells and exercises. */
export async function compileBody(body: RootContent[], ctx: LessonCompileContext): Promise<CompiledBody> {
  const headings = processHeadings(body);
  processLinksAndImages(body, ctx);

  const blocks: LessonBlock[] = [];
  const setupParts: string[] = [];
  const exerciseIds: string[] = [];
  const textParts: string[] = [];
  let prose: RootContent[] = [];
  let cellCount = 0;
  const lines: Record<string, number> = {};
  const expected: Record<string, string> = {};
  let lastCell: { id: string; index: number } | undefined;

  const flush = async (): Promise<void> => {
    if (prose.length === 0) return;
    const html = await renderGroup(prose, ctx.file);
    if (html.trim() !== '') blocks.push({ type: 'html', html });
    prose = [];
  };

  const fenceOf = (node: Code) => parseFence(node.lang, node.meta, ctx.file, node.position?.start.line);

  for (let i = 0; i < body.length; i++) {
    const node = body[i] as RootContent;
    if (node.type === 'yaml') continue;
    if (node.type !== 'code') {
      prose.push(node);
      textParts.push(mdToString(node));
      continue;
    }
    const line = node.position?.start.line;
    const info = fenceOf(node);

    if (info.kind === 'plain') {
      prose.push(node);
      continue;
    }
    if (info.kind === 'output') {
      if (lastCell && lastCell.index === i - 1) expected[lastCell.id] = node.value;
      prose.push(expectedOutputNode(node.value));
      textParts.push(node.value);
      continue;
    }

    switch (info.flag) {
      case 'run':
      case 'edit': {
        await flush();
        cellCount += 1;
        const cell: CodeCellData = {
          id: `cell-${cellCount}`,
          kind: info.flag,
          code: node.value,
          html: await highlightPython(node.value, ctx.file),
          timeoutMs: info.timeoutMs,
          ...(info.title !== undefined && { title: info.title }),
        };
        blocks.push({ type: 'cell', cell });
        lines[cell.id] = line ?? 0;
        lastCell = { id: cell.id, index: i };
        textParts.push(node.value);
        break;
      }
      case 'setup':
        setupParts.push(node.value);
        break;
      case 'exercise': {
        await flush();
        const next = body[i + 1];
        const nextInfo = next?.type === 'code' ? fenceOf(next) : undefined;
        if (next?.type !== 'code' || nextInfo?.kind !== 'python' || nextInfo.flag !== 'tests') {
          throw new ContentError(
            ctx.file,
            line,
            `exercise "${info.id}" must be followed by a "python tests" fence`,
          );
        }
        let solution: string | undefined;
        const after = body[i + 2];
        if (after?.type === 'code') {
          const afterInfo = fenceOf(after);
          if (afterInfo.kind === 'python' && afterInfo.flag === 'solution') {
            solution = after.value;
            i += 1;
          }
        }
        i += 1;
        const exercise: ExerciseData = {
          id: info.id as string,
          starter: node.value,
          starterHtml: await highlightPython(node.value, ctx.file),
          tests: next.value,
          testsHtml: await highlightPython(next.value, ctx.file),
          timeoutMs: info.timeoutMs,
          ...(solution !== undefined && {
            solution,
            solutionHtml: await highlightPython(solution, ctx.file),
          }),
          ...(info.title !== undefined && { title: info.title }),
        };
        exerciseIds.push(exercise.id);
        lines[exercise.id] = line ?? 0;
        blocks.push({ type: 'exercise', exercise });
        break;
      }
      case 'tests':
      case 'solution':
        throw exerciseOrphan(info.flag, ctx.file, line);
    }
  }
  await flush();

  return {
    lines,
    expected,
    blocks,
    headings,
    setup: setupParts.join('\n\n'),
    hasRunnable: blocks.some((b) => b.type === 'cell' || b.type === 'exercise'),
    exerciseIds,
    text: textParts.join('\n').replace(/\s+/g, ' ').trim(),
  };
}
