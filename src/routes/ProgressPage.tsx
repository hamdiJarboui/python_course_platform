import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SnakeProgress } from '@/components/SnakeProgress';
import { manifest, targetPath } from '@/content/data';
import { courseProgress, isCourseComplete, resumeTarget } from '@/core/progress';
import { progressStore, useProgress } from '@/store/progress';

function download(filename: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function Component() {
  const progress = useProgress((s) => s.progress);
  const resetCourse = useProgress((s) => s.resetCourse);
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Your progress · PyCourses';
  }, []);

  const onExport = (): void => {
    const stamp = new Date().toISOString().slice(0, 10);
    download(`pycourses-progress-${stamp}.json`, progressStore.getState().exportJson());
    setMessage({ kind: 'ok', text: 'Progress exported.' });
  };

  const onImport = async (file: File | undefined): Promise<void> => {
    if (!file) return;
    const text = await file.text();
    const result = progressStore.getState().importJson(text);
    setMessage(
      result.ok
        ? {
            kind: 'ok',
            text: 'Progress imported. It replaced the progress stored in this browser.',
          }
        : { kind: 'error', text: result.error },
    );
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <div className="container page">
      <h1 className="page-title">Your progress</h1>
      <p className="lede">
        Everything is stored in this browser. Export a backup to move to another device.
      </p>

      <div className="grid-cards">
        {manifest.courses.map((course) => {
          const f = courseProgress(progress, course);
          const cp = progress.courses[course.id];
          const lessonsDone = course.modules.reduce(
            (n, m) => n + m.lessons.filter((l) => cp?.lessons[l.id]).length,
            0,
          );
          const lessonsTotal = course.modules.reduce((n, m) => n + m.lessons.length, 0);
          const quizzes = course.modules.map((m) => ({ m, q: cp?.quizzes[m.quiz.id] }));
          const passed = quizzes.filter((x) => x.q?.passed).length;
          const exercises = Object.values(cp?.exercises ?? {}).filter((e) => e.passed).length;
          const attempts = quizzes.reduce((n, x) => n + (x.q?.attempts ?? 0), 0);
          const target = resumeTarget(progress, course);
          return (
            <section key={course.id} className="card" aria-labelledby={`pc-${course.id}`}>
              <h2 className="card__title" id={`pc-${course.id}`}>
                <Link to={`/c/${course.id}`}>{course.title}</Link>
              </h2>
              {isCourseComplete(progress, course) && (
                <span className="badge badge--gold">🏆 Course complete</span>
              )}
              <SnakeProgress percent={f.percent} label={`${course.title} progress`} />
              <div className="stats">
                <div className="stat">
                  <span className="stat__value">
                    {lessonsDone}/{lessonsTotal}
                  </span>
                  <span className="stat__label">lessons done</span>
                </div>
                <div className="stat">
                  <span className="stat__value">
                    {passed}/{course.modules.length}
                  </span>
                  <span className="stat__label">quizzes passed</span>
                </div>
                <div className="stat">
                  <span className="stat__value">{exercises}</span>
                  <span className="stat__label">exercises solved</span>
                </div>
                <div className="stat">
                  <span className="stat__value">{attempts}</span>
                  <span className="stat__label">quiz attempts</span>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <caption className="sr-only">Quiz results for {course.title}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Module</th>
                      <th scope="col">Best score</th>
                      <th scope="col">Attempts</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.map(({ m, q }) => (
                      <tr key={m.id}>
                        <th scope="row">
                          <Link to={`/c/${course.id}/${m.slug}/quiz`}>{m.title}</Link>
                        </th>
                        <td>{q ? `${q.best}%` : '—'}</td>
                        <td>{q?.attempts ?? 0}</td>
                        <td>{q?.passed ? '✓ Passed' : q ? 'Not passed' : 'Not taken'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card__footer">
                {target && (
                  <Link className="btn btn--primary btn--sm" to={targetPath(course.id, target)}>
                    {f.done > 0 ? 'Continue' : 'Start'}
                  </Link>
                )}
                {confirming === course.id ? (
                  <>
                    <button
                      type="button"
                      className="btn btn--sm btn--danger"
                      onClick={() => {
                        resetCourse(course.id);
                        setConfirming(null);
                        setMessage({ kind: 'ok', text: `Progress for ${course.title} was reset.` });
                      }}
                    >
                      Yes, reset {course.title}
                    </button>
                    <button
                      type="button"
                      className="btn btn--sm"
                      onClick={() => setConfirming(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn--sm"
                    onClick={() => setConfirming(course.id)}
                  >
                    Reset progress
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <section className="card" style={{ marginTop: 24 }} aria-labelledby="backup">
        <h2 className="card__title" id="backup">
          Backup &amp; restore
        </h2>
        <p>
          Export your progress as a JSON file, or import a file you exported earlier (this replaces
          current progress).
        </p>
        <div className="form-row">
          <button type="button" className="btn btn--primary" onClick={onExport}>
            Export progress
          </button>
          <label className="btn" htmlFor="import-file">
            Import progress…
          </label>
          <input
            id="import-file"
            ref={fileInput}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={(e) => void onImport(e.target.files?.[0])}
          />
        </div>
        {message && (
          <p className="status-msg" role="status" data-kind={message.kind}>
            {message.text}
          </p>
        )}
      </section>
    </div>
  );
}
