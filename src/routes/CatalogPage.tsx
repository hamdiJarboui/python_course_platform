import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SnakeProgress } from '@/components/SnakeProgress';
import { manifest, targetPath } from '@/content/data';
import { LEVEL_LABEL } from '@/content/labels';
import { courseProgress, isCourseComplete, resumeTarget } from '@/core/progress';
import { useProgress } from '@/store/progress';

export function Component() {
  const progress = useProgress((s) => s.progress);
  const totalLessons = manifest.courses.reduce(
    (n, c) => n + c.modules.reduce((m, mod) => m + mod.lessons.length, 0),
    0,
  );
  useEffect(() => {
    document.title = 'PyCourses — learn Python in your browser';
  }, []);

  return (
    <div className="container page">
      <section className="home-hero" aria-labelledby="home-title">
        <span className="home-hero__eyebrow">
          <b>New</b> Python runs live in your browser
        </span>
        <h1 id="home-title" className="page-title">
          Learn Python <span className="gradient-text">by doing</span>
        </h1>
        <p className="lede">
          Short lessons, code you can run and edit right on the page, and a quiz at the end of every
          module. Nothing to install — your progress is saved in this browser.
        </p>
        <div className="home-hero__cta">
          <a className="btn btn--primary btn--lg" href="#courses">
            Browse courses
          </a>
          <Link className="btn btn--lg" to="/progress">
            Your progress
          </Link>
        </div>
        <ul className="home-hero__stats" aria-label="Platform overview">
          <li>
            <strong>{manifest.courses.length}</strong>
            courses
          </li>
          <li>
            <strong>{totalLessons}</strong>
            lessons
          </li>
          <li>
            <strong>0</strong>
            installs
          </li>
        </ul>
        <div className="home-terminal" aria-hidden="true">
          <div className="home-terminal__bar">
            <i />
            <i />
            <i />
            <span>hello.py</span>
          </div>
          <pre>
            <span className="t-kw">def</span> <span className="t-fn">greet</span>(name):{'\n'}
            {'    '}
            <span className="t-kw">return</span>{' '}
            <span className="t-str">
              f&quot;Hello, {'{'}name{'}'}!&quot;
            </span>
            {'\n\n'}
            <span className="t-fn">print</span>(greet(
            <span className="t-str">&quot;future&quot;</span>)){'\n'}
            <span className="t-out">Hello, future!</span> <span className="t-caret" />
          </pre>
        </div>
      </section>

      <div className="section-head" id="courses">
        <h2>Choose your path</h2>
        <p>Start anywhere — progress is saved as you go.</p>
      </div>

      {manifest.courses.length === 0 ? (
        <div className="empty">
          <h2>No courses yet</h2>
          <p>
            Add Markdown files to <code>content/&lt;course&gt;/</code> and run{' '}
            <code>pnpm content:build</code>.
          </p>
        </div>
      ) : (
        <ul className="grid-cards" style={{ listStyle: 'none', padding: 0 }}>
          {manifest.courses.map((course) => {
            const f = courseProgress(progress, course);
            const started = f.done > 0;
            const done = isCourseComplete(progress, course);
            const target = resumeTarget(progress, course);
            const lessons = course.modules.reduce((n, m) => n + m.lessons.length, 0);
            return (
              <li key={course.id} className="card" data-testid={`course-card-${course.id}`}>
                <div className="form-row">
                  <span className="badge badge--info">{LEVEL_LABEL[course.level]}</span>
                  {done && <span className="badge badge--gold">🏆 Course complete</span>}
                </div>
                <h2 className="card__title">
                  <Link to={`/c/${course.id}`}>{course.title}</Link>
                </h2>
                <p>{course.description}</p>
                <ul className="meta" style={{ listStyle: 'none', padding: 0 }}>
                  <li>{course.modules.length} modules</li>
                  <li>{lessons} lessons</li>
                  <li>≈ {Math.round(course.minutes / 5) * 5} min</li>
                </ul>
                <SnakeProgress percent={f.percent} label={`${course.title} progress`} />
                <div className="card__footer">
                  <Link
                    className="btn btn--primary"
                    to={started && target ? targetPath(course.id, target) : `/c/${course.id}`}
                  >
                    {done ? 'Review course' : started ? 'Continue' : 'Start course'}
                  </Link>
                  <Link className="btn" to={`/c/${course.id}`}>
                    Overview
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
