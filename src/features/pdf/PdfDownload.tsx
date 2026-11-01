import { useAsync } from '@/components/useAsync';
import type { Course } from '@/core/types';

export interface PdfEntry {
  file: string;
  bytes: number;
  version: string;
  generatedAt: string;
  pages?: number;
}
export type PdfManifest = Record<string, PdfEntry>;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const base = (): string => import.meta.env.BASE_URL;

async function loadPdfManifest(): Promise<PdfManifest> {
  const res = await fetch(`${base()}pdf/manifest.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // Dev servers answer unknown paths with index.html — treat that as "missing".
  if (!(res.headers.get('content-type') ?? '').includes('json')) throw new Error('not json');
  return (await res.json()) as PdfManifest;
}

/** "Download PDF" with size + version; degrades to a hint when the PDF has not been generated. */
export function PdfDownload({ course }: { course: Course }) {
  const state = useAsync('pdf-manifest', loadPdfManifest);
  const entry = state.status === 'ready' ? state.data[course.id] : undefined;

  if (state.status === 'loading') return null;

  if (!entry) {
    return (
      <span
        className="btn"
        aria-disabled="true"
        role="link"
        title="PDF not generated yet — run `pnpm pdf`"
        data-testid="pdf-missing"
      >
        PDF not available
        <span className="sr-only"> — run pnpm pdf to generate it</span>
      </span>
    );
  }
  return (
    <a className="btn" href={`${base()}pdf/${entry.file}`} download data-testid="pdf-download">
      <span aria-hidden="true">⬇</span> Download PDF
      <span className="meta" style={{ margin: 0 }}>
        {formatBytes(entry.bytes)} · v{entry.version}
      </span>
    </a>
  );
}
