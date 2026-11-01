import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gradeQuiz, isAnswered, shuffled } from '@/core/quiz';
import type { Answer, Question, Quiz, QuizResult } from '@/core/types';
import { useProgress } from '@/store/progress';

interface Props {
  courseId: string;
  quiz: Quiz;
  /** Where to go next once the learner is done (may be undefined at the end of the course). */
  next?: { to: string; label: string };
  retryTo?: string;
}

function newSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

/** Renders a code-ish snippet (`like this`) inside plain question text. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('`') && p.endsWith('`') && p.length > 2 ? <code key={i}>{p.slice(1, -1)}</code> : <span key={i}>{p}</span>,
      )}
    </>
  );
}

function correctText(q: Question): string {
  switch (q.type) {
    case 'single':
      return q.options[q.answer] ?? '';
    case 'multiple':
      return q.answer.map((i) => q.options[i]).join(', ');
    case 'boolean':
      return q.answer ? 'True' : 'False';
    case 'short':
      return q.answer.join(' or ');
  }
}

export function QuizRunner({ courseId, quiz, next, retryTo }: Props) {
  const [seed, setSeed] = useState(newSeed);
  const questions = useMemo(
    () => (quiz.shuffle ? shuffled(quiz.questions, seed) : quiz.questions),
    [quiz, seed],
  );
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const recordQuiz = useProgress((s) => s.recordQuiz);
  const best = useProgress((s) => s.progress.courses[courseId]?.quizzes[quiz.id]);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (result) headingRef.current?.focus();
  }, [result]);

  const setAnswer = (i: number, value: Answer): void => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[i] = value;
      return copy;
    });
  };

  const answeredCount = questions.filter((q, i) => isAnswered(q, answers[i])).length;

  const submit = (e: React.FormEvent): void => {
    e.preventDefault();
    const graded = gradeQuiz({ questions, passScore: quiz.passScore }, answers);
    setResult(graded);
    recordQuiz(courseId, quiz.id, graded);
  };

  const retry = (): void => {
    setAnswers([]);
    setResult(null);
    setSeed(newSeed());
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="quiz">
      {result && (
        <div className="quiz-result" data-passed={result.passed} data-testid="quiz-result">
          <h2 ref={headingRef} tabIndex={-1}>
            {result.passed ? '🎉 You passed!' : 'Not passed yet'}
          </h2>
          <p className="quiz-result__score" aria-label={`Score ${result.score} percent`}>
            {result.score}%
          </p>
          <p>
            {result.correctCount} of {result.total} correct · pass mark {quiz.passScore}%
            {best ? ` · best ${best.best}% in ${best.attempts} attempt${best.attempts === 1 ? '' : 's'}` : ''}
          </p>
          <p>
            {result.passed
              ? 'Module passed. Review the explanations below, then continue.'
              : 'Review the explanations below, then try again — you can retry as often as you like.'}
          </p>
          <div className="quiz-actions">
            {!result.passed && (
              <button type="button" className="btn btn--primary" onClick={retry}>
                Try again
              </button>
            )}
            {result.passed && next && (
              <Link className="btn btn--primary" to={next.to}>
                {next.label}
              </Link>
            )}
            {result.passed && (
              <button type="button" className="btn" onClick={retry}>
                Retake quiz
              </button>
            )}
            {retryTo && (
              <Link className="btn" to={retryTo}>
                Back to lessons
              </Link>
            )}
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {result ? '' : `${answeredCount} of ${questions.length} answered`}
      </p>
      <ol className="dots" aria-hidden="true">
        {questions.map((q, i) => {
          const r = result?.results[i];
          const state = r ? (r.correct ? 'correct' : 'wrong') : isAnswered(q, answers[i]) ? 'answered' : 'open';
          return <li key={i} data-state={state} />;
        })}
      </ol>

      <form onSubmit={submit} noValidate>
        {questions.map((q, i) => (
          <QuestionView
            key={`${seed}-${i}`}
            index={i}
            question={q}
            answer={answers[i]}
            onAnswer={(v) => setAnswer(i, v)}
            reviewed={result?.results[i]}
          />
        ))}
        {!result && (
          <div className="quiz-actions">
            <button type="submit" className="btn btn--primary">
              Submit answers
            </button>
            <span className="meta" role="status">
              {answeredCount} of {questions.length} answered
              {answeredCount < questions.length ? ' — unanswered questions count as wrong' : ''}
            </span>
          </div>
        )}
      </form>
    </div>
  );
}

interface QuestionProps {
  index: number;
  question: Question;
  answer: Answer;
  onAnswer: (v: Answer) => void;
  reviewed: { correct: boolean; answered: boolean } | undefined;
}

function QuestionView({ index, question, answer, onAnswer, reviewed }: QuestionProps) {
  const name = `q${index}`;
  const locked = reviewed !== undefined;
  const state = reviewed ? (reviewed.correct ? 'correct' : 'wrong') : undefined;

  const isRight = (optionIndex: number): boolean =>
    question.type === 'single'
      ? question.answer === optionIndex
      : question.type === 'multiple'
        ? question.answer.includes(optionIndex)
        : false;

  const optionProps = (optionIndex: number) => {
    const chosen =
      question.type === 'single'
        ? answer === optionIndex
        : question.type === 'multiple'
          ? Array.isArray(answer) && answer.includes(optionIndex)
          : false;
    return {
      'data-right': locked && isRight(optionIndex) ? 'true' : undefined,
      'data-wrong': locked && chosen && !isRight(optionIndex) ? 'true' : undefined,
    };
  };

  return (
    <fieldset className="question" data-state={state} disabled={locked}>
      <legend>
        Question {index + 1}
        {reviewed && (
          <span className={`badge ${reviewed.correct ? 'badge--success' : ''}`} style={{ marginLeft: 8 }}>
            {reviewed.correct ? '✓ Correct' : '✗ Incorrect'}
          </span>
        )}
      </legend>
      <p className="question__text">
        <Rich text={question.q} />
        {question.type === 'multiple' && <em> (select all that apply)</em>}
      </p>

      {question.type === 'single' &&
        question.options.map((opt, oi) => (
          <label key={oi} className="option" {...optionProps(oi)}>
            <input type="radio" name={name} checked={answer === oi} onChange={() => onAnswer(oi)} />
            <span>
              <Rich text={opt} />
            </span>
          </label>
        ))}

      {question.type === 'multiple' &&
        question.options.map((opt, oi) => {
          const current = Array.isArray(answer) ? answer : [];
          return (
            <label key={oi} className="option" {...optionProps(oi)}>
              <input
                type="checkbox"
                name={name}
                checked={current.includes(oi)}
                onChange={(e) =>
                  onAnswer(e.target.checked ? [...current, oi].sort((a, b) => a - b) : current.filter((x) => x !== oi))
                }
              />
              <span>
                <Rich text={opt} />
              </span>
            </label>
          );
        })}

      {question.type === 'boolean' &&
        [true, false].map((v) => (
          <label
            key={String(v)}
            className="option"
            data-right={locked && question.answer === v ? 'true' : undefined}
            data-wrong={locked && answer === v && question.answer !== v ? 'true' : undefined}
          >
            <input type="radio" name={name} checked={answer === v} onChange={() => onAnswer(v)} />
            <span>{v ? 'True' : 'False'}</span>
          </label>
        ))}

      {question.type === 'short' && (
        <>
          <label className="sr-only" htmlFor={`${name}-text`}>
            Your answer to question {index + 1}
          </label>
          <input
            id={`${name}-text`}
            type="text"
            value={typeof answer === 'string' ? answer : ''}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => onAnswer(e.target.value)}
          />
        </>
      )}

      {reviewed && (
        <div className="explain" role="note">
          <strong>{reviewed.correct ? 'Why:' : `Answer: ${correctText(question)}.`}</strong>
          <Rich text={question.explain} />
        </div>
      )}
    </fieldset>
  );
}
