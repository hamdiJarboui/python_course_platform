import { createBrowserRouter } from 'react-router-dom';
import { ErrorPage, NotFound } from './NotFound';

/**
 * Route table (ARCHITECTURE §10). Pages are code-split; each exports `Component`.
 * `/print/:course` lives outside the layout so the PDF has no site chrome.
 */
export function createRouter() {
  return createBrowserRouter(
    [
      {
        path: '/',
        lazy: () => import('./RootLayout'),
        errorElement: <ErrorPage />,
        children: [
          { index: true, lazy: () => import('./CatalogPage') },
          { path: 'c/:course', lazy: () => import('./CoursePage') },
          { path: 'c/:course/:module/quiz', lazy: () => import('./QuizPage') },
          { path: 'c/:course/:module/:lesson', lazy: () => import('./LessonPage') },
          { path: 'progress', lazy: () => import('./ProgressPage') },
          { path: 'search', lazy: () => import('./SearchPage') },
          { path: '*', element: <NotFound /> },
        ],
      },
      { path: '/print/:course', lazy: () => import('./PrintPage'), errorElement: <ErrorPage /> },
    ],
    { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
  );
}
