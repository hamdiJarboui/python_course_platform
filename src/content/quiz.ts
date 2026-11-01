import { LineCounter, isSeq, parseDocument } from 'yaml';
import { questionSchema, MIN_QUIZ_QUESTIONS } from '@/core/schemas';
import type { Question } from '@/core/types';
import { ContentError } from './errors';

/**
 * Parses the YAML inside a ```quiz fence into validated questions.
 * `fenceLine` is the 1-based line of the opening fence so errors point at the real file line.
 */
export function parseQuizYaml(yamlText: string, file: string, fenceLine: number): Question[] {
  const lc = new LineCounter();
  const doc = parseDocument(yamlText, { lineCounter: lc });
  const lineAt = (offset: number | undefined): number =>
    fenceLine + (offset === undefined ? 1 : lc.linePos(offset).line);

  const yamlError = doc.errors[0];
  if (yamlError) {
    throw new ContentError(file, lineAt(yamlError.pos[0]), `invalid YAML in quiz: ${yamlError.message.split('\n')[0]}`);
  }
  const root = doc.contents;
  if (!isSeq(root)) {
    throw new ContentError(file, fenceLine, 'the quiz fence must contain a YAML list of questions');
  }

  const questions: Question[] = [];
  root.items.forEach((item, i) => {
    const parsed = questionSchema.safeParse(item && 'toJS' in item ? item.toJS(doc) : item);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const path = (issue?.path ?? []).map(String);
      const node = doc.getIn([i, ...path], true) as { range?: [number, number, number] } | undefined;
      const itemRange = (item as { range?: [number, number, number] } | null)?.range;
      const offset = node?.range?.[0] ?? itemRange?.[0];
      const where = path.length > 0 ? ` (${path.join('.')})` : '';
      throw new ContentError(
        file,
        lineAt(offset),
        `question ${i + 1}${where}: ${issue?.message ?? 'invalid question'}`,
      );
    }
    questions.push(parsed.data);
  });

  if (questions.length < MIN_QUIZ_QUESTIONS) {
    throw new ContentError(
      file,
      fenceLine,
      `a quiz needs at least ${MIN_QUIZ_QUESTIONS} questions, found ${questions.length}`,
    );
  }
  return questions;
}
