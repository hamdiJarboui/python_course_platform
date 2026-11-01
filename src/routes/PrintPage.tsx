import { useParams } from 'react-router-dom';
import { getCourse } from '@/content/data';
import { PrintCourse } from '@/features/pdf/PrintCourse';
import { NotFound } from './NotFound';

/** `/print/:course` — the whole course on one page; scripts/pdf.ts waits for `__PRINT_READY__`. */
export function Component() {
  const { course: id } = useParams();
  const course = getCourse(id);
  if (!course) return <NotFound what="course" />;
  return <PrintCourse course={course} />;
}
