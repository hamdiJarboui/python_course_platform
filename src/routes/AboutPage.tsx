import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/Reveal';
import { FEATURES, STEPS } from '@/content/site';

export function Component() {
  useEffect(() => {
    document.title = 'About · PyCourses';
  }, []);

  return (
    <div className="container page">
      <header className="page-hero">
        <span className="home-hero__eyebrow">About</span>
        <h1 className="page-title">
          Python, <span className="gradient-text">without the setup</span>
        </h1>
        <p className="lede">
          PyCourses exists so that the first hour of learning Python is spent writing Python, not
          installing it. Every lesson, exercise and quiz runs right here in your browser.
        </p>
      </header>

      <Reveal className="section-block">
        <div className="section-head">
          <h2>What you get</h2>
        </div>
        <ul className="feature-grid">
          {FEATURES.map((f) => (
            <li key={f.title} className="card feature">
              <span className="feature__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d={f.icon} />
                </svg>
              </span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="section-block">
        <div className="section-head">
          <h2>How a course works</h2>
        </div>
        <ol className="steps">
          {STEPS.map((st, i) => (
            <li key={st.title} className="step">
              <span className="step__num" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{st.title}</h3>
              <p>{st.text}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal className="section-block">
        <div className="section-head">
          <h2>Privacy by design</h2>
        </div>
        <div className="card prose-card">
          <p>
            There is no backend. Your code runs on your own device and your progress is kept in this
            browser&apos;s local storage. We have no accounts, no tracking of what you type and
            nothing to leak.
          </p>
          <p>
            Want to move to another device? Export your progress from the{' '}
            <Link to="/progress">Progress</Link> page and import it anywhere.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
