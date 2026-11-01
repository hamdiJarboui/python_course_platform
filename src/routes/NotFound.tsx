import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Logo } from '@/components/Logo';

export function NotFound({ what = 'page', courseId }: { what?: string; courseId?: string }) {
  return (
    <div className="container page">
      <div className="empty" data-testid="not-found">
        <Logo />
        <h1>We could not find that {what}</h1>
        <p>It may have been moved or renamed.</p>
        <div className="form-row" style={{ justifyContent: 'center' }}>
          {courseId && (
            <Link className="btn btn--primary" to={`/c/${courseId}`}>
              Back to the course
            </Link>
          )}
          <Link className={`btn ${courseId ? '' : 'btn--primary'}`} to="/">
            Browse all courses
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Component() {
  return <NotFound />;
}

/** Router-level error boundary (also catches render errors in any page). */
export function ErrorPage() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  return (
    <div className="container page">
      <div className="empty" role="alert">
        <Logo />
        <h1>Something went wrong</h1>
        <p>{message}</p>
        <div className="form-row" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
            Reload the page
          </button>
          <Link className="btn" to="/">
            Back to courses
          </Link>
        </div>
      </div>
    </div>
  );
}
