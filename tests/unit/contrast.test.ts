import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Contrast guard for docs/DESIGN_SYSTEM.md: text on surfaces ≥ 4.5:1, UI borders/icons ≥ 3:1,
 * in both themes. Reads the real tokens so a palette tweak cannot silently break accessibility.
 */
const css = readFileSync(
  fileURLToPath(new URL('../../src/styles/tokens.css', import.meta.url)),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

type Tokens = Record<string, string>;

function block(selectorPattern: RegExp): Tokens {
  const out: Tokens = {};
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selectorPattern.test((m[1] ?? '').trim())) continue;
    for (const d of (m[2] ?? '').matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g))
      out[d[1] as string] = (d[2] as string).trim();
  }
  return out;
}

const base = { ...block(/^:root\s*$/), ...block(/^:root,\s*\[data-theme='light'\]$/) };
const light: Tokens = { ...base };
const dark: Tokens = { ...base, ...block(/^\[data-theme='dark'\]$/) };

function resolve(tokens: Tokens, value: string, depth = 0): string {
  const m = /^var\((--[\w-]+)\)$/.exec(value);
  if (!m || depth > 5) return value;
  return resolve(tokens, tokens[m[1] as string] ?? value, depth + 1);
}

type RGBA = [number, number, number, number];
function parse(color: string): RGBA {
  const hex = /^#([0-9a-f]{6})$/i.exec(color);
  if (hex) {
    const n = parseInt(hex[1] as string, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const rgba = /^rgba?\(([^)]+)\)$/.exec(color);
  if (rgba) {
    const [r, g, b, a] = (rgba[1] as string).split(',').map((s) => Number(s.trim()));
    return [r ?? 0, g ?? 0, b ?? 0, a ?? 1];
  }
  throw new Error(`cannot parse colour "${color}"`);
}

/** Composites a possibly translucent colour over an opaque background. */
function over(fg: RGBA, bg: RGBA): RGBA {
  const a = fg[3];
  return [0, 1, 2]
    .map((i) => Math.round((fg[i] as number) * a + (bg[i] as number) * (1 - a)))
    .concat(1) as RGBA;
}

function luminance([r, g, b]: RGBA): number {
  const f = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a: RGBA, b: RGBA): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

function color(tokens: Tokens, name: string, backdrop?: RGBA): RGBA {
  const raw = tokens[name];
  if (raw === undefined) throw new Error(`token ${name} missing`);
  const c = parse(resolve(tokens, raw));
  return backdrop ? over(c, backdrop) : c;
}

const themes: [string, Tokens][] = [
  ['light', light],
  ['dark', dark],
];

describe.each(themes)('%s theme contrast', (_name, t) => {
  const solid = (n: string): RGBA => color(t, n);

  it.each(['--bg', '--surface', '--surface-2'])('body text on %s is ≥ 4.5:1', (surface) => {
    expect(ratio(solid('--text'), solid(surface))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['--bg', '--surface', '--surface-2'])('muted text on %s is ≥ 4.5:1', (surface) => {
    expect(ratio(solid('--text-muted'), solid(surface))).toBeGreaterThanOrEqual(4.5);
  });

  it('primary button text on --accent is ≥ 4.5:1', () => {
    expect(ratio(solid('--accent-contrast'), solid('--accent'))).toBeGreaterThanOrEqual(4.5);
  });

  it('links are readable on the surface', () => {
    const link = _name === 'light' ? '--accent-strong' : '--accent';
    expect(ratio(solid(link), solid('--surface'))).toBeGreaterThanOrEqual(4.5);
    expect(ratio(solid(link), solid('--bg'))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['--success', '--danger', '--warning', '--info'])(
    '%s status colour is readable on surfaces and its tint',
    (name) => {
      const tint = name.replace('--', '--') + '-bg';
      expect(ratio(solid(name), solid('--surface'))).toBeGreaterThanOrEqual(4.5);
      expect(ratio(solid(name), color(t, tint, solid('--surface')))).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(['--text', '--text-muted'])('%s stays readable on status tints', (name) => {
    for (const tint of ['--success-bg', '--danger-bg', '--warning-bg', '--info-bg']) {
      expect(ratio(solid(name), color(t, tint, solid('--surface')))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each([
    '--tok-keyword',
    '--tok-string',
    '--tok-number',
    '--tok-comment',
    '--tok-function',
    '--tok-builtin',
    '--tok-operator',
  ])('syntax colour %s is ≥ 4.5:1 on the code background', (name) => {
    expect(ratio(solid(name), solid('--code-bg'))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['--bg', '--surface'])('control borders (--border-strong) on %s are ≥ 3:1', (surface) => {
    expect(ratio(solid('--border-strong'), solid(surface))).toBeGreaterThanOrEqual(3);
  });
});
