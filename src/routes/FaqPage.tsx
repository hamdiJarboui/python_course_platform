import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaqList } from '@/components/FaqList';

export function Component() {
  useEffect(() => {
    document.title = 'FAQ · PyCourses';
  }, []);

  return (
    <div className="container page">
      <header className="page-hero">
        <span className="home-hero__eyebrow">FAQ</span>
        <h1 className="page-title">
          Questions, <span className="gradient-text">answered</span>
        </h1>
        <p className="lede">
          Everything people ask before they start. Cannot find yours? Try the lesson search.
        </p>
      </header>
      <FaqList />
      <p className="page-note">
        Still curious? <Link to="/about">Read about the platform</Link> or{' '}
        <Link to="/search">search the lessons</Link>.
      </p>
    </div>
  );
}
