import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAsync } from '@/components/useAsync';
import { getSearchIndex } from '@/content/data';
import { runSearch } from '@/content/search';

export function Component() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const index = useAsync('search-index', getSearchIndex);

  useEffect(() => {
    document.title = q ? `Search: ${q} · PyCourses` : 'Search · PyCourses';
  }, [q]);

  const hits = index.status === 'ready' ? runSearch(index.data, q, 20) : [];

  return (
    <div className="container page">
      <h1 className="page-title">Search lessons</h1>
      <form
        role="search"
        className="form-row"
        onSubmit={(e) => {
          e.preventDefault();
          const value = String(new FormData(e.currentTarget).get('q') ?? '').trim();
          setParams(value ? { q: value } : {});
        }}
      >
        <label htmlFor="search-page-q" className="sr-only">
          Search query
        </label>
        <input id="search-page-q" name="q" type="search" defaultValue={q} key={q} style={{ flex: 1, minWidth: 200 }} />
        <button type="submit" className="btn btn--primary">
          Search
        </button>
      </form>

      <div role="status" aria-live="polite">
        {index.status === 'loading' && <p>Loading search index…</p>}
        {index.status === 'error' && <p>Search is unavailable: {index.error.message}</p>}
        {index.status === 'ready' && q && (
          <p className="meta">
            {hits.length === 0 ? `No lessons match “${q}”.` : `${hits.length} result${hits.length === 1 ? '' : 's'} for “${q}”`}
          </p>
        )}
      </div>

      {hits.length > 0 && (
        <ul className="search-results">
          {hits.map((h) => (
            <li key={h.id}>
              <h2>
                <Link to={h.route}>{h.title}</Link>
              </h2>
              <p className="meta" style={{ margin: 0 }}>
                {h.courseTitle} › {h.moduleTitle}
              </p>
              <p>{h.snippet}</p>
            </li>
          ))}
        </ul>
      )}
      {!q && index.status === 'ready' && <p className="lede">Type a word such as “loop”, “dictionary” or “class”.</p>}
    </div>
  );
}
