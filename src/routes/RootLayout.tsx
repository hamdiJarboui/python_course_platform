import { useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Backdrop } from '@/components/Backdrop';
import { InputProvider } from '@/components/InputDialog';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAmbientMotion } from '@/components/useAmbientMotion';
import { useProgress } from '@/store/progress';

function SearchForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const location = useLocation();
  const ref = useRef<HTMLInputElement>(null);

  // "/" focuses search unless the learner is typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      const typing =
        el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
      if (typing || el?.closest('.cm-editor')) return;
      e.preventDefault();
      ref.current?.focus();
      ref.current?.select();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get('q') ?? '').trim();
    if (q) void navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form className="search-form" role="search" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="site-search">
        Search lessons
      </label>
      <svg className="search-form__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </svg>
      <input
        id="site-search"
        ref={ref}
        name="q"
        type="search"
        placeholder="Search lessons…"
        autoComplete="off"
        defaultValue={location.pathname === '/search' ? (params.get('q') ?? '') : ''}
        key={location.pathname === '/search' ? params.get('q') : 'idle'}
      />
      <kbd className="search-form__kbd" aria-hidden="true">
        /
      </kbd>
    </form>
  );
}

function StorageBanner() {
  const persistent = useProgress((s) => s.persistent);
  const notice = useProgress((s) => s.notice);
  const dismiss = useProgress((s) => s.dismissNotice);
  if (persistent && !notice) return null;
  return (
    <div className="banner" role="status">
      <div className="container">
        <span>
          {notice ??
            'Your browser is blocking local storage, so progress will be lost when you close this tab. Use Progress → Export to keep a backup.'}
        </span>
        {notice && (
          <button type="button" className="btn btn--sm" onClick={dismiss}>
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

/** Pages fade in on navigation; inside a course the shell stays put and only the lesson animates. */
function transitionKey(pathname: string): string {
  const m = /^\/c\/([^/]+)\/[^/]+\/[^/]+/.exec(pathname);
  return m ? `course:${m[1]}` : pathname;
}

export function Component() {
  useAmbientMotion();
  const location = useLocation();
  return (
    <InputProvider>
      <div className="app">
        <Backdrop />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <header className="header">
          <div className="container header__inner">
            <Link className="brand" to="/" aria-label="PyCourses home">
              <span className="brand__mark">
                <Logo />
              </span>
              <span className="brand__name">
                Py<em>Courses</em>
              </span>
            </Link>
            <nav className="nav" aria-label="Main">
              <NavLink className="nav__link" to="/" end>
                Courses
              </NavLink>
              <NavLink className="nav__link" to="/progress">
                Progress
              </NavLink>
              <NavLink className="nav__link nav__link--search" to="/search">
                Search
              </NavLink>
            </nav>
            <span className="header__spacer" />
            <SearchForm />
            <ThemeToggle />
          </div>
          <span className="scroll-beam" aria-hidden="true" />
        </header>
        <StorageBanner />
        <main className="main" id="main" tabIndex={-1}>
          <div className="route-enter" key={transitionKey(location.pathname)}>
            <Outlet />
          </div>
        </main>
        <footer className="footer">
          <div className="container footer__inner">
            <span className="brand brand--sm">
              <span className="brand__mark">
                <Logo />
              </span>
              <span className="brand__name">
                Py<em>Courses</em>
              </span>
            </span>
            <p>Python in your browser, powered by Pyodide. Your progress stays on this device.</p>
            <span className="footer__status">
              <span className="pulse-dot" aria-hidden="true" />
              Nothing to install · no account needed
            </span>
          </div>
        </footer>
        <ScrollRestoration />
      </div>
    </InputProvider>
  );
}
