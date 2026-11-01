/** Node-only helpers for the content scripts (not bundled into the browser app). */
import { cp, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { compileContent } from './compile';
import type { CompileResult } from './compile';
import { idToFile } from './ids';
import { buildSearchIndex } from './search';

const TEXT_EXT = /\.(md|ya?ml)$/;

export async function loadContentFiles(contentDir: string): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  async function walk(dir: string): Promise<void> {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'assets') continue; // binary assets are copied, not parsed
        await walk(full);
      } else if (TEXT_EXT.test(entry.name)) {
        files[relative(contentDir, full).split(sep).join('/')] = (await readFile(full, 'utf8')).replace(/\r\n/g, '\n');
      }
    }
  }
  await walk(contentDir);
  return files;
}

export interface BuildPaths {
  contentDir: string;
  outDir: string;
  publicDir: string;
}

export interface BuildSummary extends CompileResult {
  files: number;
}

/** Compiles `content/` and writes `src/generated/**`. Returns the result (errors included). */
export async function buildContent(
  paths: BuildPaths,
  options: { includeFixtures?: boolean; assetBase?: string; write?: boolean } = {},
): Promise<BuildSummary> {
  const files = await loadContentFiles(paths.contentDir);
  const result = await compileContent(files, options);
  if (result.errors.length > 0 || options.write === false) {
    return { ...result, files: Object.keys(files).length };
  }

  // Replace files atomically and prune stale ones, so a concurrent `vite`/`tsc` never sees a missing file.
  await mkdir(join(paths.outDir, 'lessons'), { recursive: true });
  const written = new Set<string>();
  const write = async (name: string, data: unknown): Promise<void> => {
    const target = join(paths.outDir, name);
    const tmp = `${target}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(data), 'utf8');
    await rename(tmp, target);
    written.add(name.split(sep).join('/'));
  };

  await write('manifest.json', result.manifest);
  for (const [id, lesson] of Object.entries(result.lessons)) await write(join('lessons', idToFile(id)), lesson);
  for (const [id, quiz] of Object.entries(result.quizzes)) await write(join('lessons', idToFile(id)), quiz);
  await write('search-index.json', buildSearchIndex(result.search).toJSON());
  for (const stale of await readdir(join(paths.outDir, 'lessons'))) {
    if (!written.has(`lessons/${stale}`)) await rm(join(paths.outDir, 'lessons', stale), { force: true });
  }

  // Course assets (images) are served from public/course-assets/<course>/.
  const assetsOut = join(paths.publicDir, 'course-assets');
  await rm(assetsOut, { recursive: true, force: true });
  for (const course of result.manifest.courses) {
    for (const dir of await findAssetDirs(paths.contentDir, course.id)) {
      await mkdir(join(assetsOut, course.id), { recursive: true });
      await cp(dir, join(assetsOut, course.id), { recursive: true });
    }
  }
  return { ...result, files: Object.keys(files).length };
}

async function findAssetDirs(contentDir: string, courseId: string): Promise<string[]> {
  const found: string[] = [];
  async function walk(dir: string): Promise<void> {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const full = join(dir, entry.name);
      if (entry.name === courseId) {
        const assets = join(full, 'assets');
        try {
          await readdir(assets);
          found.push(assets);
        } catch {
          /* no assets */
        }
      } else if (entry.name === '__fixtures__') {
        await walk(full);
      }
    }
  }
  await walk(contentDir);
  return found;
}
