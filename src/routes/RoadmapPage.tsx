import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/Reveal';
import { SnakeProgress } from '@/components/SnakeProgress';
import { manifest, targetPath } from '@/content/data';
import { LEVEL_LABEL } from '@/content/labels';
import { UPCOMING } from '@/content/site';
import { courseProgress, resumeTarget } from '@/core/progress';
import { useProgress } from '@/store/progress';

export function Component() {
  const progress = useProgress((s) => s.progress);
  useEffect(() => {
    document.title = 'Roadmap · PyCourses';
  }, []);

  return (
    <div className="container page">
      <header className="page-hero">
        <span className="home-hero__eyebrow">Roadmap</span>
        <h1 className="page-title">
          Your path from <span className="gradient-text">zero to confident</span>
        </h1>
        <p className="lede">
          Follow the courses in order, or jump in where you already are. What is next is below.
        </p>
      </header>

      <ol className="timeline">
        {manifest.courses.map((course, i) => {
          const f = courseProgress(progress, course);
          const target = resumeTarget(progress, course);
          const state = f.percent >= 100 ? 'done' : f.done > 0 ? 'active' : 'todo';
          return (
            <li key={course.id} className="timeline__item" data-state={state}>
              <span className="timeline__dot" aria-hidden="true">
                {state === 'done' ? '✓' : i + 1}
              </span>
              <Reveal className="card timeline__card">
                <span className="badge badge--info">{LEVEL_LABEL[course.level]}</span>
                <h2 className="card__title">{course.title}</h2>
                <p>{course.description}</p>
                <ul className="meta" style={{ listStyle: 'none', padding: 0 }}>
                  {course.modules.map((m) => (
                    <li key={m.id}>{m.title}</li>
                  ))}
                </ul>
                <SnakeProgress percent={f.percent} label={`${course.title} progress`} />
                <div className="card__footer">
                  <Link
                    className="btn btn--primary"
                    to={f.done > 0 && target ? targetPath(course.id, target) : `/c/${course.id}`}
                  >
                    {state === 'done' ? 'Review' : state === 'active' ? 'Continue' : 'Start'}
                  </Link>
                </div>
              </Reveal>
            </li>
          );
        })}
        {UPCOMING.map((u) => (
          <li key={u.title} className="timeline__item" data-state="soon">
            <span className="timeline__dot" aria-hidden="true">
              ⋯
            </span>
            <Reveal className="card timeline__card">
              <span className="badge">Coming soon</span>
              <h2 className="card__title">{u.title}</h2>
              <p>{u.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}
