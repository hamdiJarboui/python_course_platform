import MiniSearch from 'minisearch';
import type { Options, SearchResult } from 'minisearch';

/** Shared by the build (index creation) and the app (index loading) so they never drift. */
export const SEARCH_OPTIONS: Options = {
  fields: ['title', 'headings', 'text'],
  storeFields: ['title', 'route', 'courseTitle', 'moduleTitle', 'text'],
  searchOptions: {
    boost: { title: 3, headings: 2 },
    prefix: true,
    fuzzy: 0.2,
    combineWith: 'AND',
  },
};

export interface SearchDocInput {
  id: string;
  title: string;
  headings: string;
  text: string;
  route: string;
  courseTitle: string;
  moduleTitle: string;
}

export interface SearchHit {
  id: string;
  title: string;
  route: string;
  courseTitle: string;
  moduleTitle: string;
  snippet: string;
  score: number;
}

export function buildSearchIndex(docs: SearchDocInput[]): MiniSearch {
  const ms = new MiniSearch(SEARCH_OPTIONS);
  ms.addAll(docs);
  return ms;
}

export function loadSearchIndex(json: string | object): MiniSearch {
  return MiniSearch.loadJS(typeof json === 'string' ? (JSON.parse(json) as never) : (json as never), SEARCH_OPTIONS);
}

/** A ~140 character window of `text` around the first matched term. */
export function makeSnippet(text: string, terms: string[], length = 140): string {
  const lower = text.toLowerCase();
  let at = -1;
  for (const t of terms) {
    const i = lower.indexOf(t.toLowerCase());
    if (i >= 0 && (at < 0 || i < at)) at = i;
  }
  const start = Math.max(0, (at < 0 ? 0 : at) - 40);
  const slice = text.slice(start, start + length).trim();
  return `${start > 0 ? '…' : ''}${slice}${start + length < text.length ? '…' : ''}`;
}

export function runSearch(index: MiniSearch, query: string, limit = 10): SearchHit[] {
  const q = query.trim();
  if (q === '') return [];
  return index.search(q).slice(0, limit).map((r: SearchResult) => ({
    id: String(r.id),
    title: String(r['title']),
    route: String(r['route']),
    courseTitle: String(r['courseTitle']),
    moduleTitle: String(r['moduleTitle']),
    snippet: makeSnippet(String(r['text'] ?? ''), r.terms),
    score: r.score,
  }));
}
