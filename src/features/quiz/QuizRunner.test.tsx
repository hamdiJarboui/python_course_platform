// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Quiz } from '@/core/types';
import { progressStore } from '@/store/progress';
import { QuizRunner } from './QuizRunner';

const quiz: Quiz = {
  id: 'c/m/99-quiz',
  title: 'Quiz',
  passScore: 70,
  shuffle: false,
  questions: [
    {
      type: 'single',
      q: 'Which prints text?',
      options: ['echo()', 'print()', 'say()'],
      answer: 1,
      explain: 'print writes output.',
    },
    {
      type: 'multiple',
      q: 'Valid names?',
      options: ['my_var', '2cool', '_x'],
      answer: [0, 2],
      explain: 'No leading digits.',
    },
    { type: 'boolean', q: 'Python is static.', answer: false, explain: 'It is dynamic.' },
    {
      type: 'short',
      q: 'Keyword for functions?',
      answer: ['def'],
      explain: 'def defines functions.',
    },
    {
      type: 'single',
      q: 'Pick `len`',
      options: ['len', 'size'],
      answer: 0,
      explain: 'len() counts items.',
    },
  ],
};

function renderQuiz() {
  return render(
    <MemoryRouter>
      <QuizRunner
        courseId="c"
        quiz={quiz}
        next={{ to: '/next', label: 'Continue →' }}
        retryTo="/c/c"
      />
    </MemoryRouter>,
  );
}

async function answerAll(user: ReturnType<typeof userEvent.setup>, correct: boolean) {
  const sets = screen.getAllByRole('group'); // fieldsets
  await user.click(within(sets[0]!).getAllByRole('radio')[correct ? 1 : 0]!);
  for (const i of correct ? [0, 2] : [1])
    await user.click(within(sets[1]!).getAllByRole('checkbox')[i]!);
  await user.click(within(sets[2]!).getAllByRole('radio')[correct ? 1 : 0]!); // False / True
  await user.type(within(sets[3]!).getByRole('textbox'), correct ? ' DEF ' : 'fn');
  await user.click(within(sets[4]!).getAllByRole('radio')[correct ? 0 : 1]!);
}

describe('QuizRunner', () => {
  beforeEach(() => {
    localStorage.clear();
    progressStore.setState({ progress: { version: 1, courses: {} } });
  });

  it('renders all four question types with real radios, checkboxes and a text input', () => {
    renderQuiz();
    expect(screen.getAllByRole('group')).toHaveLength(5);
    expect(screen.getAllByRole('radio').length).toBeGreaterThanOrEqual(7);
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getAllByText('len')[0]?.tagName).toBe('CODE'); // inline code in question text
  });

  it('passes with all correct answers, saves the attempt and offers to continue', async () => {
    const user = userEvent.setup();
    renderQuiz();
    await answerAll(user, true);
    await user.click(screen.getByRole('button', { name: /submit answers/i }));

    const result = screen.getByTestId('quiz-result');
    expect(result).toHaveAttribute('data-passed', 'true');
    expect(result).toHaveTextContent('100%');
    expect(screen.getByRole('link', { name: /continue/i })).toHaveAttribute('href', '/next');
    expect(progressStore.getState().progress.courses['c']?.quizzes['c/m/99-quiz']).toMatchObject({
      best: 100,
      attempts: 1,
      passed: true,
    });
    // Explanations are shown for every question after submitting.
    expect(screen.getByText(/print writes output/i)).toBeInTheDocument();
  });

  it('fails with wrong answers, shows the right answer, and retry resets the form', async () => {
    const user = userEvent.setup();
    renderQuiz();
    await answerAll(user, false);
    await user.click(screen.getByRole('button', { name: /submit answers/i }));

    expect(screen.getByTestId('quiz-result')).toHaveAttribute('data-passed', 'false');
    expect(screen.getByText(/Answer: print\(\)/)).toBeInTheDocument();
    expect(screen.getByText(/Answer: my_var, _x/)).toBeInTheDocument();
    expect(progressStore.getState().progress.courses['c']?.quizzes['c/m/99-quiz']?.passed).toBe(
      false,
    );

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(screen.queryByTestId('quiz-result')).not.toBeInTheDocument();
    expect(screen.getAllByRole('radio').every((r) => !(r as HTMLInputElement).checked)).toBe(true);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('counts unanswered questions as wrong and says so', async () => {
    const user = userEvent.setup();
    renderQuiz();
    expect(screen.getByRole('status')).toHaveTextContent('0 of 5 answered');
    await user.click(screen.getByRole('button', { name: /submit answers/i }));
    expect(screen.getByTestId('quiz-result')).toHaveTextContent('0%');
  });

  it('keeps a passed quiz passed after a later failed attempt', async () => {
    const user = userEvent.setup();
    renderQuiz();
    await answerAll(user, true);
    await user.click(screen.getByRole('button', { name: /submit answers/i }));
    await user.click(screen.getByRole('button', { name: /retake quiz/i }));
    await user.click(screen.getByRole('button', { name: /submit answers/i }));
    expect(progressStore.getState().progress.courses['c']?.quizzes['c/m/99-quiz']).toMatchObject({
      best: 100,
      attempts: 2,
      passed: true,
    });
  });
});
