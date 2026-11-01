import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Course, ID } from '@/core/types';
import { CourseNav } from './CourseNav';

interface Props {
  course: Course;
  currentId?: ID;
  children: ReactNode;
}

/** Sidebar + content layout; the sidebar becomes a drawer below 900 px. */
export function CourseShell({ course, currentId, children }: Props) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="container">
      <div className="lesson-layout">
        <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
          <button
            ref={toggle}
            type="button"
            className="btn btn--sm sidebar__toggle"
            aria-expanded={open}
            aria-controls="course-sidebar"
            onClick={() => setOpen((v) => !v)}
          >
            ☰ Course menu
          </button>
          {open && <button type="button" className="sidebar__scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
          <div className="sidebar__panel" id="course-sidebar">
            <CourseNav course={course} {...(currentId !== undefined && { currentId })} onNavigate={() => setOpen(false)} />
          </div>
        </aside>
        <div className="lesson-main" id="content">
          {children}
        </div>
      </div>
    </div>
  );
}
