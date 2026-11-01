import { Link, useParams } from 'react-router-dom';
import { getCourse, getLesson, getModule } from '@/content/data';
import { isModuleUnlocked } from '@/core/progress';
import { CourseShell } from '@/features/course/CourseShell';
import { LessonView } from '@/features/lesson/LessonView';
import { useProgress } from '@/store/progress';
import { NotFound } from './NotFound';

export function Component() {
  const params = useParams();
  const course = getCourse(params['course']);
  const mod = getModule(course, params['module']);
  const lesson = getLesson(mod, params['lesson']);
  const progress = useProgress((s) => s.progress);

  if (!course) return <NotFound what="course" />;
  if (!mod || !lesson) return <NotFound what="lesson" courseId={course.id} />;

  const index = course.modules.findIndex((m) => m.id === mod.id);
  const unlocked = isModuleUnlocked(progress, course, index);
  const previous = course.modules[index - 1];

  return (
    <CourseShell course={course} currentId={lesson.id}>
      {unlocked ? (
        <LessonView key={lesson.id} course={course} mod={mod} lesson={lesson} />
      ) : (
        <div className="locked-note" role="status" style={{ marginTop: 24 }}>
          <h1>🔒 This module is locked</h1>
          <p>
            Pass the quiz for <strong>{previous?.title}</strong> to unlock{' '}
            <strong>{mod.title}</strong>.
          </p>
          {previous && (
            <Link className="btn btn--primary" to={`/c/${course.id}/${previous.slug}/quiz`}>
              Go to {previous.title} quiz
            </Link>
          )}
        </div>
      )}
    </CourseShell>
  );
}
