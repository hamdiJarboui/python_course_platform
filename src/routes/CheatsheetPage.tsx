import { useEffect } from 'react';
import { Reveal } from '@/components/Reveal';
import { CHEATSHEET } from '@/content/site';

export function Component() {
  useEffect(() => {
    document.title = 'Cheatsheet · PyCourses';
  }, []);

  return (
    <div className="container page">
      <header className="page-hero">
        <span className="home-hero__eyebrow">Cheatsheet</span>
        <h1 className="page-title">
          Python on <span className="gradient-text">one page</span>
        </h1>
        <p className="lede">
          The syntax you reach for every day, grouped by topic. Keep it open in a tab.
        </p>
      </header>
      <div className="cheat-grid">
        {CHEATSHEET.map((g, i) => (
          <Reveal key={g.title} delay={(i % 3) * 70}>
            <section className="card cheat" aria-labelledby={`cheat-${i}`}>
              <h2 id={`cheat-${i}`} className="card__title">
                {g.title}
              </h2>
              <dl>
                {g.items.map((it) => (
                  <div key={it.code} className="cheat__row">
                    <dt>
                      <code>{it.code}</code>
                    </dt>
                    <dd>{it.note}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
