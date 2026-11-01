import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SnakeProgress } from '@/components/SnakeProgress';
import { getCourse, targetPath } from '@/content/data';
import { LEVEL_LABEL } from '@/content/labels';
import {
  courseProgress,
  isCourseComplete,
  isModuleComplete,
  isModuleUnlocked,
  moduleProgress,
  resumeTarget,
} from '@/core/progress';
import { PdfDownload } from '@/features/pdf/PdfDownload';
import { useProgress } from '@/store/progress';
import { NotFound } from './NotFound';

export function Component() {
  const { course: courseId } = useParams();
  const course = getCourse(courseId);
  const progress = useProgress((s) => s.progress);

  useEffect(() => {
    if (course) document.title = `${course.title} · PyCourses`;
  }, [course]);

  if (!course) return <NotFound what="course" />;

  const f = courseProgress(progress, course);
  const target = resumeTarget(progress, course);
  const started = f.done > 0;
  const done = isCourseComplete(progress, course);
  const cp = progress.courses[course.id];

  return (
    <div className="container page">
      <div className="hero">
        <div className="form-row">
          <span className="badge badge--info">{LEVEL_LABEL[course.level]}</span>
          <span className="badge">v{course.version}</span>
          {done && <span className="badge badge--gold">🏆 Course complete</span>}
        </div>
        <h1 className="page-title">{course.title}</h1>
        <p className="lede">{course.description}</p>
        <ul className="meta" style={{ listStyle: 'none', padding: 0 }}>
          <li>{course.modules.length} modules</li>
          <li>{course.modules.reduce((n, m) => n + m.lessons.length, 0)} lessons</li>
          <li>≈ {Math.round(course.minutes / 5) * 5} minutes</li>
          <li>{course.gating === 'quiz' ? 'Pass each quiz to unlock the next module' : 'Learn in any order'}</li>
        </ul>
        <div style={{ maxWidth: 520 }}>
          <SnakeProgress percent={f.percent} label={`${course.title} progress`} />
        </div>
        <div className="hero__actions">
          {target && (
            <Link className="btn btn--primary" to={targetPath(course.id, target)}>
              {done ? 'Review from the start' : started ? 'Continue where you left off' : 'Start the course'}
            </Link>
          )}
          <PdfDownload course={course} />
        </div>
      </div>

      <h2 className="sr-only">Course contents</h2>
      {course.modules.map((mod, mi) => {
        const unlocked = isModuleUnlocked(progress, course, mi);
        const mp = moduleProgress(progress, course, mod);
        const passed = cp?.quizzes[mod.quiz.id]?.passed === true;
        return (
          <section key={mod.id} className="toc-module" data-locked={!unlocked} aria-labelledby={`m-${mod.slug}`}>
            <div className="toc-module__head">
              <h3 id={`m-${mod.slug}`} style={{ margin: 0, flex: 1, fontSize: '1.15rem' }}>
                {!unlocked && <span aria-hidden="true">🔒 </span>}
                Module {mod.order}: {mod.title}
              </h3>
              {passed && <span className="badge badge--success">✓ Module passed</span>}
              <span className="meta" style={{ margin: 0 }}>
                {mp.done} / {mp.total} done
              </span>
            </div>
            {mod.summary && <p className="toc-module__summary">{mod.summary}</p>}
            <ul className="toc-list">
              {mod.lessons.map((l) => {
                const complete = Boolean(cp?.lessons[l.id]);
                return (
                  <li key={l.id}>
                    {unlocked ? (
                      <Link to={`/c/${course.id}/${mod.slug}/${l.slug}`}>
                        <span className="toc-item__mark" aria-hidden="true">
                          {complete ? '✓' : ''}
                        </span>
                        <span>
                          {l.title}
                          {complete && <span className="sr-only"> (completed)</span>}
                        </span>
                        <span className="toc-item__time">{l.minutes} min</span>
                      </Link>
                    ) : (
                      <span className="toc-item--locked">
                        <span className="toc-item__mark" aria-hidden="true">
                          🔒
                        </span>
                        <span>{l.title}</span>
                        <span className="toc-item__time">{l.minutes} min</span>
                      </span>
                    )}
                  </li>
                );
              })}
              <li>
                {unlocked ? (
                  <Link to={`/c/${course.id}/${mod.slug}/quiz`}>
                    <span className="toc-item__mark" aria-hidden="true">
                      {passed ? '✓' : ''}
                    </span>
                    <span>
                      <strong>{mod.quiz.title}</strong>
                      {passed && <span className="sr-only"> (passed)</span>}
                    </span>
                    <span className="toc-item__time">
                      {cp?.quizzes[mod.quiz.id] ? `best ${cp.quizzes[mod.quiz.id]?.best}% · ` : ''}
                      {mod.quiz.questionCount} questions · pass {mod.quiz.passScore}%
                    </span>
                  </Link>
                ) : (
                  <span className="toc-item--locked">
                    <span className="toc-item__mark" aria-hidden="true">
                      🔒
                    </span>
                    <span>{mod.quiz.title}</span>
                    <span className="toc-item__time">locked</span>
                  </span>
                )}
              </li>
            </ul>
            {isModuleComplete(progress, course, mod) && <p className="toc-module__summary">Module complete — great job!</p>}
          </section>
        );
      })}
    </div>
  );
}
