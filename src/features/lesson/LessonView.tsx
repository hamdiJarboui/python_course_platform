import { useEffect, useMemo } from 'react';
import type { MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SnakeProgress } from '@/components/SnakeProgress';
import { useAsync } from '@/components/useAsync';
import { loadLesson, targetPath } from '@/content/data';
import { courseProgress, isLessonComplete, neighbours } from '@/core/progress';
import type { Course, LessonBlock, LessonMeta, Module } from '@/core/types';
import { CodeCell } from '@/features/playground/CodeCell';
import { ExerciseCell } from '@/features/playground/ExerciseCell';
import { LessonRunProvider } from '@/features/playground/context';
import type { LessonRunContext } from '@/features/playground/context';
import { useProgress } from '@/store/progress';

import 'katex/dist/katex.min.css';

/** Prose HTML from the build. Internal `.md` links were rewritten to routes; navigate without reloading. */
function Prose({ html }: { html: string }) {
  const navigate = useNavigate();
  const onClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest('a[data-internal]');
    if (!(a instanceof HTMLAnchorElement)) return;
    e.preventDefault();
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const href = a.getAttribute('href') ?? '';
    void navigate(href.startsWith(base) && base !== '' ? href.slice(base.length) : href);
  };
  return <div className="prose" onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'html':
            return <Prose key={i} html={b.html} />;
          case 'cell':
            return <CodeCell key={b.cell.id} cell={b.cell} />;
          case 'exercise':
            return <ExerciseCell key={b.exercise.id} exercise={b.exercise} />;
        }
      })}
    </>
  );
}

interface Props {
  course: Course;
  mod: Module;
  lesson: LessonMeta;
}

export function LessonView({ course, mod, lesson }: Props) {
  const state = useAsync(lesson.id, () => loadLesson(lesson.id));
  const progress = useProgress((s) => s.progress);
  const complete = isLessonComplete(progress, course.id, lesson.id);
  const markComplete = useProgress((s) => s.completeLesson);
  const uncomplete = useProgress((s) => s.uncompleteLesson);
  const setLast = useProgress((s) => s.setLast);
  const { prev, next } = neighbours(course, lesson.id);
  const overall = courseProgress(progress, course);

  useEffect(() => {
    setLast(course.id, lesson.id);
    window.scrollTo({ top: 0 });
  }, [course.id, lesson.id, setLast]);

  const ctx = useMemo<LessonRunContext | null>(
    () =>
      state.status === 'ready'
        ? {
            courseId: course.id,
            lessonId: lesson.id,
            scope: state.data.scope,
            setup: state.data.setup,
            packages: course.pythonPackages,
          }
        : null,
    [state, course.id, course.pythonPackages, lesson.id],
  );

  useEffect(() => {
    document.title = `${lesson.title} · ${course.title} · PyCourses`;
  }, [lesson.title, course.title]);

  return (
    <article>
      <div className="lesson-sticky">
        <p className="breadcrumbs">
          <Link to={`/c/${course.id}`}>{course.title}</Link> › {mod.title}
        </p>
        <SnakeProgress percent={overall.percent} label={`${course.title} progress`} />
      </div>

      <header className="lesson-header">
        <ul className="meta">
          <li>⏱ {lesson.minutes} min</li>
          <li>
            Lesson {lesson.order} of {mod.lessons.length}
          </li>
          {complete && <li className="badge badge--success">✓ Completed</li>}
        </ul>
      </header>

      {state.status === 'loading' && <p role="status">Loading lesson…</p>}
      {state.status === 'error' && (
        <div className="locked-note" role="alert">
          <p>
            <strong>Could not load this lesson.</strong> {state.error.message}
          </p>
          <button type="button" className="btn" onClick={state.reload}>
            Try again
          </button>
        </div>
      )}
      {state.status === 'ready' && ctx && (
        <LessonRunProvider value={ctx}>
          {state.data.objectives.length > 0 && (
            <aside className="objectives" aria-label="Learning objectives">
              <h2>You will learn to</h2>
              <ul>
                {state.data.objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </aside>
          )}
          <LessonBlocks blocks={state.data.blocks} />
        </LessonRunProvider>
      )}

      <footer className="lesson-footer">
        <div className="form-row">
          <button
            type="button"
            className={`btn ${complete ? '' : 'btn--primary'}`}
            aria-pressed={complete}
            onClick={() => (complete ? uncomplete(course.id, lesson.id) : markComplete(course.id, lesson.id))}
          >
            {complete ? '✓ Completed (click to undo)' : 'Mark complete'}
          </button>
          <button type="button" className="btn no-print" onClick={() => window.print()}>
            Print lesson
          </button>
        </div>
        <nav className="pager" aria-label="Lesson navigation">
          {prev ? (
            <Link className="btn" to={targetPath(course.id, prev)} rel="prev">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link className="btn btn--primary" to={targetPath(course.id, next)} rel="next">
              {next.kind === 'quiz' ? 'Take the module quiz →' : 'Next →'}
            </Link>
          )}
        </nav>
      </footer>
    </article>
  );
}
