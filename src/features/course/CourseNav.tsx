import { Link } from 'react-router-dom';
import { isModuleComplete, isModuleUnlocked } from '@/core/progress';
import type { Course, ID } from '@/core/types';
import { useProgress } from '@/store/progress';

interface Props {
  course: Course;
  currentId?: ID;
  onNavigate?: () => void;
}

/** Sidebar table of contents with per-lesson completion marks and gating locks. */
export function CourseNav({ course, currentId, onNavigate }: Props) {
  const progress = useProgress((s) => s.progress);
  const cp = progress.courses[course.id];

  return (
    <nav aria-label={`${course.title} contents`}>
      <Link className="sidebar__course" to={`/c/${course.id}`} onClick={onNavigate}>
        {course.title}
      </Link>
      {course.modules.map((mod, mi) => {
        const unlocked = isModuleUnlocked(progress, course, mi);
        const done = isModuleComplete(progress, course, mod);
        const hasCurrent = mod.quiz.id === currentId || mod.lessons.some((l) => l.id === currentId);
        return (
          <details key={mod.id} open={hasCurrent || (unlocked && !done && currentId === undefined)}>
            <summary>
              {!unlocked && <span aria-hidden="true">🔒 </span>}
              {mod.title}
              {done && <span className="sr-only"> (completed)</span>}
              {done && <span aria-hidden="true"> ✓</span>}
              {!unlocked && <span className="sr-only"> (locked until the previous quiz is passed)</span>}
            </summary>
            <ul>
              {mod.lessons.map((l) => (
                <li key={l.id}>
                  {unlocked ? (
                    <Link
                      to={`/c/${course.id}/${mod.slug}/${l.slug}`}
                      aria-current={l.id === currentId ? 'page' : undefined}
                      onClick={onNavigate}
                    >
                      <span className="toc-item__mark" aria-hidden="true">
                        {cp?.lessons[l.id] ? '✓' : ''}
                      </span>
                      <span>
                        {l.title}
                        {cp?.lessons[l.id] && <span className="sr-only"> (completed)</span>}
                      </span>
                    </Link>
                  ) : (
                    <span className="toc-item--locked">
                      <span className="toc-item__mark" aria-hidden="true">
                        🔒
                      </span>
                      <span>{l.title}</span>
                    </span>
                  )}
                </li>
              ))}
              <li>
                {unlocked ? (
                  <Link
                    to={`/c/${course.id}/${mod.slug}/quiz`}
                    aria-current={mod.quiz.id === currentId ? 'page' : undefined}
                    onClick={onNavigate}
                  >
                    <span className="toc-item__mark" aria-hidden="true">
                      {cp?.quizzes[mod.quiz.id]?.passed ? '✓' : ''}
                    </span>
                    <span>
                      Module quiz
                      {cp?.quizzes[mod.quiz.id]?.passed && <span className="sr-only"> (passed)</span>}
                    </span>
                  </Link>
                ) : (
                  <span className="toc-item--locked">
                    <span className="toc-item__mark" aria-hidden="true">
                      🔒
                    </span>
                    <span>Module quiz</span>
                  </span>
                )}
              </li>
            </ul>
          </details>
        );
      })}
    </nav>
  );
}
