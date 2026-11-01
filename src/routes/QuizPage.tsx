import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAsync } from '@/components/useAsync';
import { getCourse, getModule, loadQuiz, targetPath } from '@/content/data';
import { isModuleUnlocked, neighbours, previousQuizPending } from '@/core/progress';
import { CourseShell } from '@/features/course/CourseShell';
import { QuizRunner } from '@/features/quiz/QuizRunner';
import { useProgress } from '@/store/progress';
import { NotFound } from './NotFound';

export function Component() {
  const params = useParams();
  const course = getCourse(params['course']);
  const mod = getModule(course, params['module']);
  const progress = useProgress((s) => s.progress);
  const setLast = useProgress((s) => s.setLast);
  const quizId = mod?.quiz.id ?? '';
  const state = useAsync(quizId, () => loadQuiz(quizId));

  useEffect(() => {
    if (course && mod) {
      setLast(course.id, mod.quiz.id);
      document.title = `${mod.quiz.title} · ${course.title} · PyCourses`;
    }
  }, [course, mod, setLast]);

  if (!course) return <NotFound what="course" />;
  if (!mod) return <NotFound what="quiz" courseId={course.id} />;

  const index = course.modules.findIndex((m) => m.id === mod.id);
  const unlocked = isModuleUnlocked(progress, course, index);
  const nudge = previousQuizPending(progress, course, index);
  const nextTarget = neighbours(course, mod.quiz.id).next;
  const prevModule = course.modules[index - 1];

  return (
    <CourseShell course={course} currentId={mod.quiz.id}>
      <article>
        <p className="breadcrumbs">
          <Link to={`/c/${course.id}`}>{course.title}</Link> › {mod.title}
        </p>
        <h1>{mod.quiz.title}</h1>
        <p className="lede">
          {mod.quiz.questionCount} questions · pass mark {mod.quiz.passScore}% · retake as often as
          you like.
        </p>
        {!unlocked && prevModule ? (
          <div className="locked-note" role="status">
            <h2>🔒 Locked</h2>
            <p>
              Pass the <strong>{prevModule.title}</strong> quiz first.
            </p>
            <Link className="btn btn--primary" to={`/c/${course.id}/${prevModule.slug}/quiz`}>
              Go to the {prevModule.title} quiz
            </Link>
          </div>
        ) : (
          <>
            {nudge && prevModule && (
              <p className="nudge" role="note">
                Tip: you have not passed the{' '}
                <Link to={`/c/${course.id}/${prevModule.slug}/quiz`}>{prevModule.title} quiz</Link>{' '}
                yet. You can continue, but it is a good way to check your understanding first.
              </p>
            )}
            {state.status === 'loading' && <p role="status">Loading quiz…</p>}
            {state.status === 'error' && (
              <div className="locked-note" role="alert">
                <p>Could not load the quiz: {state.error.message}</p>
                <button type="button" className="btn" onClick={state.reload}>
                  Try again
                </button>
              </div>
            )}
            {state.status === 'ready' && (
              <QuizRunner
                key={state.data.id}
                courseId={course.id}
                quiz={state.data}
                retryTo={`/c/${course.id}`}
                {...(nextTarget && {
                  next: {
                    to: targetPath(course.id, nextTarget),
                    label:
                      nextTarget.kind === 'lesson' && nextTarget.moduleSlug !== mod.slug
                        ? 'Start the next module →'
                        : 'Continue →',
                  },
                })}
              />
            )}
          </>
        )}
      </article>
    </CourseShell>
  );
}
