import { Fragment, useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';
import { loadLesson, loadQuiz } from '@/content/data';
import type { Course, LessonContent, Question, Quiz } from '@/core/types';
import { runtime } from '@/runtime';
import { forceTheme } from '@/store/theme';

import 'katex/dist/katex.min.css';
import '@/styles/print.css';

interface CellOutput {
  stdout: string;
  stderr: string;
  result: string | null;
  failed: boolean;
}

interface Loaded {
  lessons: Map<string, LessonContent>;
  quizzes: Map<string, Quiz>;
}

/** Heading levels shift by one so Module = h1, Lesson = h2, section = h3 (clean PDF outline). */
export function shiftHeadings(html: string): string {
  return html
    .replace(/<h([1-5])(?=[\s>])/g, (_, n: string) => `<h${Number(n) + 1}`)
    .replace(/<\/h([1-5])>/g, (_, n: string) => `</h${Number(n) + 1}>`);
}

/** `input()` has no human in the PDF run, so cells get plausible sample answers. */
export function sampleAnswer(prompt: string): string {
  return /name/i.test(prompt) ? 'Ada' : '10';
}

function QuestionPrint({ q, n }: { q: Question; n: number }) {
  return (
    <div className="print-question">
      <p>
        <strong>{n}.</strong> {q.q}
        {q.type === 'multiple' && <em> (select all that apply)</em>}
      </p>
      {(q.type === 'single' || q.type === 'multiple') && (
        <ol>
          {q.options.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ol>
      )}
      {q.type === 'boolean' && <p>☐ True &nbsp;&nbsp; ☐ False</p>}
      {q.type === 'short' && <p>Answer: ______________________</p>}
    </div>
  );
}

function answerText(q: Question): string {
  switch (q.type) {
    case 'single':
      return `${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer] ?? ''}`;
    case 'multiple':
      return q.answer
        .map((i) => `${String.fromCharCode(65 + i)}. ${q.options[i] ?? ''}`)
        .join('; ');
    case 'boolean':
      return q.answer ? 'True' : 'False';
    case 'short':
      return q.answer.join(' / ');
  }
}

export function PrintCourse({ course }: { course: Course }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [outputs, setOutputs] = useState<Record<string, CellOutput>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => forceTheme('light'), []);

  // 1. Load every lesson and quiz of the course.
  useEffect(() => {
    window.__PRINT_READY__ = false;
    let cancelled = false;
    (async () => {
      const lessons = new Map<string, LessonContent>();
      const quizzes = new Map<string, Quiz>();
      for (const mod of course.modules) {
        for (const l of mod.lessons) lessons.set(l.id, await loadLesson(l.id));
        quizzes.set(mod.quiz.id, await loadQuiz(mod.quiz.id));
      }
      if (!cancelled) setLoaded({ lessons, quizzes });
    })().catch((e: unknown) => {
      if (!cancelled) setError(e instanceof Error ? e.message : String(e));
    });
    return () => {
      cancelled = true;
    };
  }, [course]);

  // 2. Run every runnable cell, one after the other, sharing one interpreter.
  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    (async () => {
      for (const mod of course.modules) {
        for (const meta of mod.lessons) {
          const lesson = loaded.lessons.get(meta.id);
          if (!lesson) continue;
          for (const block of lesson.blocks) {
            if (cancelled) return;
            if (block.type !== 'cell') continue;
            const key = `${lesson.id}#${block.cell.id}`;
            const res = await runtime.run(
              {
                code: block.cell.code,
                timeoutMs: block.cell.timeoutMs,
                packages: course.pythonPackages,
                ...(lesson.scope === 'lesson' && { namespace: lesson.id }),
                ...(lesson.setup !== '' && { setup: lesson.setup }),
              },
              { onInput: (prompt) => Promise.resolve(sampleAnswer(prompt)) },
            );
            setOutputs((o) => ({
              ...o,
              [key]: {
                stdout: res.stdout,
                stderr: res.stderr,
                result: res.result,
                failed: res.status !== 'ok' && res.stdout === '' && res.stderr === '',
              },
            }));
          }
        }
      }
      if (!cancelled) {
        runtime.dispose();
        window.__PRINT_READY__ = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loaded, course]);

  if (error) return <p role="alert">Could not prepare the print view: {error}</p>;
  if (!loaded) return <p role="status">Preparing {course.title} for print…</p>;

  const today = new Date().toISOString().slice(0, 10);
  const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0);

  return (
    <div className="print-doc" data-testid="print-doc">
      <section className="print-cover">
        <Logo className="print-cover__badge" />
        <span className="badge">Python course · {course.level}</span>
        <h1>{course.title}</h1>
        <p className="lede">{course.description}</p>
        <ul className="meta" style={{ listStyle: 'none', padding: 0 }}>
          <li>{course.modules.length} modules</li>
          <li>{lessonCount} lessons</li>
          <li>Version {course.version}</li>
          <li>Generated {today}</li>
        </ul>
      </section>

      <nav className="print-toc" aria-label="Table of contents">
        <h1>Contents</h1>
        <ol>
          {course.modules.map((mod) => (
            <li key={mod.id}>
              <strong>
                Module {mod.order}: {mod.title}
              </strong>
              <ol>
                {mod.lessons.map((l) => (
                  <li key={l.id}>{l.title}</li>
                ))}
                <li>{mod.quiz.title}</li>
              </ol>
            </li>
          ))}
          <li>
            <strong>Answer key</strong>
          </li>
        </ol>
      </nav>

      {course.modules.map((mod) => {
        const quiz = loaded.quizzes.get(mod.quiz.id);
        return (
          <section key={mod.id} className="print-module">
            <h1>
              Module {mod.order}: {mod.title}
            </h1>
            {mod.summary && <p className="lede">{mod.summary}</p>}
            {mod.lessons.map((meta) => {
              const lesson = loaded.lessons.get(meta.id);
              if (!lesson) return null;
              return (
                <article key={meta.id} className="print-lesson">
                  {lesson.blocks.map((b, i) => {
                    if (b.type === 'html') {
                      return (
                        <div
                          key={i}
                          className="prose"
                          dangerouslySetInnerHTML={{ __html: shiftHeadings(b.html) }}
                        />
                      );
                    }
                    if (b.type === 'cell') {
                      const out = outputs[`${lesson.id}#${b.cell.id}`];
                      return (
                        <Fragment key={i}>
                          <div className="cell">
                            {b.cell.title && (
                              <div className="cell__bar">
                                <span className="cell__title">{b.cell.title}</span>
                              </div>
                            )}
                            <div
                              className="cell__editor"
                              dangerouslySetInnerHTML={{ __html: b.cell.html }}
                            />
                          </div>
                          <div className="print-cell__output" aria-label="Output">
                            {!out && <span className="print-cell--running" />}
                            {out?.failed && (
                              <span className="print-warning">⚠ output unavailable</span>
                            )}
                            {out && out.stdout !== '' && <pre>{out.stdout}</pre>}
                            {out && out.stderr !== '' && (
                              <pre className="out-stderr">{out.stderr}</pre>
                            )}
                            {out?.result != null && (
                              <pre className="out-result">{`→ ${out.result}`}</pre>
                            )}
                            {out &&
                              !out.failed &&
                              out.stdout === '' &&
                              out.stderr === '' &&
                              out.result === null && <span className="out-empty">(no output)</span>}
                          </div>
                        </Fragment>
                      );
                    }
                    return (
                      <div key={i} className="cell exercise">
                        <div className="cell__bar">
                          <span className="cell__title exercise__label">
                            ✎ Exercise — solution in the answer key
                          </span>
                        </div>
                        <div
                          className="cell__editor"
                          dangerouslySetInnerHTML={{ __html: b.exercise.starterHtml }}
                        />
                      </div>
                    );
                  })}
                </article>
              );
            })}
            {quiz && (
              <section className="print-lesson">
                <h2>{quiz.title}</h2>
                <p className="meta">
                  Pass mark {quiz.passScore}% · answers are in the answer key at the end.
                </p>
                {quiz.questions.map((q, i) => (
                  <QuestionPrint key={i} q={q} n={i + 1} />
                ))}
              </section>
            )}
          </section>
        );
      })}

      <section className="print-key">
        <h1>Answer key</h1>
        {course.modules.map((mod) => {
          const quiz = loaded.quizzes.get(mod.quiz.id);
          const exercises = mod.lessons.flatMap((meta) =>
            (loaded.lessons.get(meta.id)?.blocks ?? []).flatMap((b) =>
              b.type === 'exercise' ? [{ lesson: meta.title, ex: b.exercise }] : [],
            ),
          );
          return (
            <Fragment key={mod.id}>
              <h2>
                Module {mod.order}: {mod.title}
              </h2>
              {exercises.length > 0 && <h3>Exercise solutions</h3>}
              {exercises.map(({ lesson, ex }) => (
                <div key={ex.id} style={{ breakInside: 'avoid' }}>
                  <p>
                    <strong>{lesson}</strong> — <code>{ex.id}</code>
                  </p>
                  {ex.solutionHtml && <div dangerouslySetInnerHTML={{ __html: ex.solutionHtml }} />}
                  <details open>
                    <summary>Tests</summary>
                    <div dangerouslySetInnerHTML={{ __html: ex.testsHtml }} />
                  </details>
                </div>
              ))}
              {quiz && <h3>{quiz.title}</h3>}
              {quiz && (
                <ol>
                  {quiz.questions.map((q, i) => (
                    <li key={i} style={{ breakInside: 'avoid' }}>
                      <strong>{answerText(q)}</strong> — {q.explain}
                    </li>
                  ))}
                </ol>
              )}
            </Fragment>
          );
        })}
      </section>
    </div>
  );
}
