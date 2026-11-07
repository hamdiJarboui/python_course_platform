import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { getAllLessons, getCourse, getLesson, getModule, getModules, getQuiz } from './lib/content';
import { getPrevNextLesson } from './lib/navigation';
import { runPython } from './lib/python';
import { isPassed, scoreQuiz } from './lib/quiz';
import { parseProgress, serializeProgress } from './lib/storage';
import { useProgress } from './stores/progressStore';
import { useTheme } from './stores/themeStore';
import type { Answer, ContentBlock, ParsedLesson, QuizQuestion, ThemePreference } from './types';

const course = getCourse();
const modules = getModules();
const lessons = getAllLessons();
const selectedIds = (answer: Answer | undefined): string[] => Array.isArray(answer) ? answer : [];

/* ============ Icons (Lucide-style, stroke = currentColor) ============ */
type IconProps = { size?: number; className?: string };
function Svg({ size = 18, className = '', children }: IconProps & { children: React.ReactNode }) {
  return <svg className={`icon${className ? ` ${className}` : ''}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}
const Menu = (p: IconProps) => <Svg {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Svg>;
const X = (p: IconProps) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
const Play = (p: IconProps) => <Svg {...p}><path d="M6 4l14 8-14 8V4z" /></Svg>;
const Check = (p: IconProps) => <Svg {...p}><path d="M20 6L9 17l-5-5" /></Svg>;
const ArrowRight = (p: IconProps) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
const ArrowLeft = (p: IconProps) => <Svg {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></Svg>;
const ChevronRight = (p: IconProps) => <Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>;
const Sun = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Svg>;
const Moon = (p: IconProps) => <Svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></Svg>;
const Monitor = (p: IconProps) => <Svg {...p}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></Svg>;
const BookOpen = (p: IconProps) => <Svg {...p}><path d="M2 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2zM22 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22z" /></Svg>;
const Layers = (p: IconProps) => <Svg {...p}><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></Svg>;
const CheckCircle = (p: IconProps) => <Svg {...p}><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" /><path d="M22 4 12 14l-3-3" /></Svg>;
const Zap = (p: IconProps) => <Svg {...p}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></Svg>;
const Code = (p: IconProps) => <Svg {...p}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /></Svg>;
const TrendingUp = (p: IconProps) => <Svg {...p}><path d="M22 7l-8.5 8.5-5-5L2 17M16 7h6v6" /></Svg>;
const Terminal = (p: IconProps) => <Svg {...p}><path d="m4 17 6-5-6-5M12 19h8" /></Svg>;
const HelpCircle = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4M12 17h.01" /></Svg>;
const FileText = (p: IconProps) => <Svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></Svg>;
const Download = (p: IconProps) => <Svg {...p}><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></Svg>;
const Upload = (p: IconProps) => <Svg {...p}><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></Svg>;
const Award = (p: IconProps) => <Svg {...p}><circle cx="12" cy="8" r="6" /><path d="M8.2 13.9 7 22l5-3 5 3-1.2-8.1" /></Svg>;
const RotateCcw = (p: IconProps) => <Svg {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" /></Svg>;
const Signal = (p: IconProps) => <Svg {...p}><path d="M4 20v-4M9 20v-8M14 20v-12M19 20V4" /></Svg>;
const Clock = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>;
const Globe = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" /></Svg>;
const AlertCircle = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></Svg>;

function ThemeControl({ labeled = false }: { labeled?: boolean }) {
  const { preference, setPreference } = useTheme();
  const options: Array<{ value: ThemePreference; label: string; icon: React.ReactNode }> = [
    { value: 'system', label: 'System', icon: <Monitor size={16} /> },
    { value: 'light', label: 'Light', icon: <Sun size={16} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
  ];
  return <div className={`theme-control${labeled ? ' labeled' : ''}`} role="group" aria-label="Theme preference">
    {options.map((option) => <button key={option.value} type="button" className={`theme-option${preference === option.value ? ' active' : ''}`} aria-pressed={preference === option.value} title={option.label} onClick={() => setPreference(option.value)}>{option.icon}{labeled ? <span>{option.label}</span> : <span className="visually-hidden">{option.label}</span>}</button>)}
  </div>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const progress = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const done = lessons.filter((lesson) => progress.lessons[lesson.id]?.completed).length;
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <div className="header-inner">
        <button className="mobile-menu icon-button" aria-label="Open course navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><Menu size={20} /></button>
        <Link className="brand" to="/"><span className="brand-mark">Py</span>Course</Link>
        <nav className="main-nav" aria-label="Primary">
          <NavLink to="/" end>Courses</NavLink>
          <Link to="/#curriculum">Learning paths</Link>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
        <div className="header-actions">
          <ThemeControl />
          <Link className="button primary small" to="/resume"><Play size={15} /><span>Resume</span></Link>
        </div>
      </div>
    </header>
    <div className="app-shell">
      <aside className={`sidebar${menuOpen ? ' open' : ''}`} aria-label="Course modules">
        <div className="sidebar-head">
          <div>
            <p className="sidebar-title">Your course</p>
            <div className="sidebar-progress">
              <ProgressBar value={done / lessons.length * 100} />
              <small>{done} of {lessons.length} lessons complete</small>
            </div>
          </div>
          <button className="sidebar-close icon-button" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={18} /></button>
        </div>
        <nav className="sidebar-nav">
          {modules.map((module) => {
            const moduleDone = module.lessons.filter((lesson) => progress.lessons[lesson.id]?.completed).length;
            const allDone = moduleDone === module.lessons.length;
            return <NavLink className="side-link" onClick={() => setMenuOpen(false)} key={module.id} to={`/modules/${module.id}`}>
              <span className="side-number">{allDone ? <Check size={14} /> : String(module.order).padStart(2, '0')}</span>
              <span className="side-text"><span>{module.title}</span><span className={`side-count${allDone ? ' side-done' : ''}`}>{moduleDone}/{module.lessons.length} lessons</span></span>
            </NavLink>;
          })}
        </nav>
        <div className="sidebar-foot">
          <Link className="sidebar-pdf" to="/export/pdf" onClick={() => setMenuOpen(false)}><FileText size={16} />Download course PDF</Link>
        </div>
      </aside>
      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <main id="main">{progress.storageError && <p className="storage-warning" role="alert"><AlertCircle size={16} />{progress.storageError}</p>}{children}</main>
    </div>
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="footer-brand"><span className="brand-mark">Py</span>PyCourse</span>
        <span>Learn Python by building. Runs entirely in your browser.</span>
        <nav className="footer-links" aria-label="Footer">
          <Link to="/">Overview</Link>
          <Link to="/settings">Settings</Link>
          <Link to="/export/pdf">Course PDF</Link>
        </nav>
      </div>
    </footer>
  </>;
}

function ProgressBar({ value }: { value: number }) { return <div className="progress-track" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${value}%` }} /></div>; }

function Overview() {
  const progress = useProgress();
  const done = lessons.filter((lesson) => progress.lessons[lesson.id]?.completed).length;
  const resume = lessons.find((lesson) => lesson.id === progress.lastVisitedLessonId);
  return <section className="page overview">
    <div className="course-breadcrumb"><Link to="/">Home</Link><ChevronRight size={13} /><span>Computer Programming</span><ChevronRight size={13} /><strong>Python Foundations</strong></div>
    <div className="hero">
      <div className="hero-copy">
        <p className="hero-badge"><span className="dot" />Python Foundations · Beginner</p>
        <h1>Learn Python by building <span className="highlight">real programs.</span></h1>
        <p className="lede">{course.description}</p>
        <div className="course-meta">
          <span><span className="meta-icon"><Signal size={17} /></span><span><b>Level</b><em>Beginner</em></span></span>
          <span><span className="meta-icon"><Clock size={17} /></span><span><b>Format</b><em>Self-paced</em></span></span>
          <span><span className="meta-icon"><Globe size={17} /></span><span><b>Language</b><em>English</em></span></span>
        </div>
        <div className="actions">
          <Link className="button primary" to={resume ? `/modules/${resume.moduleId}/lessons/${resume.id}` : `/modules/${modules[0].id}`}>{resume ? 'Continue learning' : 'Start learning'}<ArrowRight size={16} /></Link>
          <a className="button secondary" href="#curriculum">View curriculum</a>
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-card">
          <div className="terminal-bar"><span className="code-dots"><i /><i /><i /></span><span className="terminal-title">lesson_01.py</span><span className="terminal-lang">Python</span></div>
          <pre><code><span className="purple">def</span> <span className="blue">learn</span>(topic):{'\n'}    <span className="blue">print</span>(<span className="yellow">{'f"Learning {topic}"'}</span>){'\n'}    <span className="green">return</span> <span className="yellow">"keep building"</span>{'\n\n'}<span className="blue">learn</span>(<span className="yellow">"Python"</span>)</code></pre>
          <div className="hero-output"><Check size={15} />Run Python directly in your browser</div>
        </div>
        <span className="hero-chip chip-setup"><Zap size={14} />No setup needed</span>
        <span className="hero-chip chip-run"><Play size={14} />Edit &amp; run live</span>
      </div>
    </div>
    <div className="stat-row">
      <div className="stat-card"><span className="stat-icon"><BookOpen size={19} /></span><div><strong>{lessons.length}</strong><span>focused lessons</span></div></div>
      <div className="stat-card"><span className="stat-icon accent"><Layers size={19} /></span><div><strong>{modules.length}</strong><span>hands-on modules</span></div></div>
      <div className="stat-card"><span className="stat-icon success"><CheckCircle size={19} /></span><div><strong>{done}/{lessons.length}</strong><span>lessons completed</span></div></div>
      <div className="stat-card"><span className="stat-icon"><Zap size={19} /></span><div><strong>100%</strong><span>in your browser</span></div></div>
    </div>
    {resume && <div className="resume-banner"><span className="resume-icon"><Play size={18} /></span><div><strong>Pick up where you left off</strong><p>{resume.title}</p></div><Link className="button primary small" to={`/modules/${resume.moduleId}/lessons/${resume.id}`}>Continue<ArrowRight size={15} /></Link></div>}
    <section className="outcomes"><div><p className="eyebrow">Your outcome</p><h2>From first line to first project.</h2><p>Build the confidence to read Python, experiment safely, and break bigger problems into smaller steps.</p></div><ul><li><span>01</span>Write and run readable Python programs</li><li><span>02</span>Use core language features with intention</li><li><span>03</span>Debug by turning errors into clues</li></ul></section>
    <section className="learning-details">
      <div className="learning-details-head"><div><p className="eyebrow">What you’ll learn</p><h2>Skills that compound.</h2></div></div>
      <div className="learning-grid">
        <div><span className="detail-icon"><Code size={20} /></span><h3>Python fundamentals</h3><p>Variables, types, strings, collections, and the syntax behind clear programs.</p></div>
        <div><span className="detail-icon accent"><TrendingUp size={20} /></span><h3>Problem-solving habits</h3><p>Practice breaking problems down, testing ideas, and learning from errors.</p></div>
        <div><span className="detail-icon success"><Terminal size={20} /></span><h3>Interactive practice</h3><p>Run and edit examples in the browser as you move through each lesson.</p></div>
      </div>
    </section>
    <div id="curriculum" className="section-heading"><div><p className="eyebrow">The path</p><h2>Build your Python foundation</h2></div><span className="count-pill">{done} / {lessons.length} complete</span></div>
    <div className="module-grid">{modules.map((module) => <ModuleCard key={module.id} module={module} />)}</div>
  </section>;
}

function ModuleCard({ module }: { module: ReturnType<typeof getModules>[number] }) {
  const progress = useProgress();
  const done = module.lessons.filter((lesson) => progress.lessons[lesson.id]?.completed).length;
  const complete = progress.modules[module.id]?.completed;
  return <Link className="module-card" to={`/modules/${module.id}`}>
    <div className="module-card-top"><span className="module-number">{String(module.order).padStart(2, '0')}</span><span className={`pill${complete ? ' complete' : ''}`}>{complete ? <><Check size={12} />Complete</> : `Module ${module.order}`}</span></div>
    <h3>{module.title}</h3>
    <p>{module.description}</p>
    <ProgressBar value={done / module.lessons.length * 100} />
    <div className="card-footer"><span><BookOpen size={14} />{module.lessons.length} lessons</span><span className="card-cta">View module<ArrowRight size={15} /></span></div>
  </Link>;
}

function ModulePage() {
  const { moduleId } = useParams();
  const module = getModule(moduleId!);
  const progress = useProgress();
  if (!module) return <Navigate to="/" />;
  const done = module.lessons.filter((lesson) => progress.lessons[lesson.id]?.completed).length;
  const completed = progress.modules[module.id]?.completed;
  return <section className="page">
    <Link className="back-link" to="/"><ArrowLeft size={15} />Course overview</Link>
    <div className="module-intro"><p className="eyebrow">Module {module.order}</p><h1>{module.title}</h1><p className="lede">{module.description}</p><ProgressBar value={done / module.lessons.length * 100} /><span className="muted">{done} of {module.lessons.length} lessons complete{completed ? ' · module passed' : ''}</span></div>
    <div className="lesson-list">{module.lessons.map((lesson) => {
      const isDone = progress.lessons[lesson.id]?.completed;
      return <Link className="lesson-row" key={lesson.id} to={`/modules/${module.id}/lessons/${lesson.id}`}><span className={`lesson-check${isDone ? ' done' : ''}`}>{isDone ? <Check size={15} /> : lesson.order}</span><span><strong>{lesson.title}</strong><small>Lesson {lesson.order} · 10 min</small></span><ArrowRight size={17} className="arrow" /></Link>;
    })}</div>
    <Link className="quiz-cta" to={`/modules/${module.id}/quiz`}><span className="quiz-icon"><HelpCircle size={21} /></span><span><strong>Module checkpoint</strong><small>Five questions · retry as often as you need</small></span><span className="quiz-cta-action">Take quiz<ArrowRight size={15} /></span></Link>
  </section>;
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index} className="inline-code">{part.slice(1, -1)}</code>;
    return <span key={index}>{part}</span>;
  });
}

function renderLine(line: string, key: number) {
  if (line.startsWith('# ')) return <h2 key={key}>{line.slice(2)}</h2>;
  if (line.startsWith('## ')) return <h2 key={key}>{line.slice(3)}</h2>;
  return <p key={key}>{renderInline(line)}</p>;
}

function renderText(value: string) {
  return value.split(/\n{2,}/).map((paragraph, index) => (
    <div key={index} className="content-block">
      {paragraph.split('\n').map((line, lineIndex) => renderLine(line, lineIndex))}
    </div>
  ));
}

function PythonBlock({ block, lessonId, blockId }: { block: Extract<ContentBlock, { type: 'code' }>; lessonId: string; blockId: string }) {
  const progress = useProgress();
  const [code, setCode] = useState(progress.getCode(lessonId, blockId, block.code));
  const [output, setOutput] = useState({ stdout: '', stderr: '', error: '', running: false });
  const run = async () => { setOutput({ stdout: '', stderr: '', error: '', running: true }); const result = await runPython(code, blockId); setOutput({ stdout: result.stdout, stderr: result.stderr, error: result.error ?? '', running: false }); };
  const hasOutput = Boolean(output.stdout || output.stderr || output.error);
  return <div className="code-card runnable">
    <div className="code-header"><div className="code-header-left"><span className="code-dots"><i /><i /><i /></span><span className="code-title">{block.title ?? 'Try it yourself'}</span></div><span className="code-label">Python · Runnable</span></div>
    <textarea aria-label={`Editable Python example ${blockId}`} value={code} onChange={(event) => { setCode(event.target.value); progress.saveCode(lessonId, blockId, event.target.value); }} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') void run(); }} spellCheck={false} />
    <div className="code-actions"><button className="button primary small" onClick={() => void run()} disabled={output.running}><Play size={14} />{output.running ? 'Loading Python…' : 'Run code'}</button><button className="button ghost small" onClick={() => { setCode(block.code); progress.saveCode(lessonId, blockId, block.code); setOutput({ stdout: '', stderr: '', error: '', running: false }); }}><RotateCcw size={14} />Reset</button><span className="shortcut"><kbd>Ctrl</kbd> + <kbd>Enter</kbd></span></div>
    {hasOutput && <div className="output-wrap"><div className="output-label"><span>Output</span>{output.error && <span>Error</span>}</div><pre className={`output${output.error ? ' error' : ''}`} role="status">{output.stdout}{output.stderr}{output.error && `Error: ${output.error}`}</pre></div>}
  </div>;
}

function LessonPage() {
  const { moduleId, lessonId } = useParams();
  const lesson = getLesson(lessonId!);
  const module = getModule(moduleId!);
  const progress = useProgress();
  const navigate = useNavigate();
  const visitLesson = useProgress((state) => state.visitLesson);
  useEffect(() => { if (lesson) visitLesson(lesson.id); }, [lesson?.id, visitLesson]);
  if (!lesson || !module) return <Navigate to="/" />;
  const { previous, next } = getPrevNextLesson(lesson.id, lessons);
  return <section className="page lesson-page">
    <Link className="back-link" to={`/modules/${module.id}`}><ArrowLeft size={15} />{module.title}</Link>
    <div className="lesson-header"><p className="eyebrow">Lesson {lesson.order} · {module.title}</p><h1>{lesson.title}</h1><p className="lede">{lesson.description}</p></div>
    <article className="lesson-content">{lesson.blocks.map((block, index) => block.type === 'text' ? <div key={index}>{renderText(block.value)}</div> : block.executable ? <PythonBlock key={index} block={block} lessonId={lesson.id} blockId={`${lesson.id}-${index}`} /> : <div className="code-card static" key={index}><div className="code-header"><div className="code-header-left"><span className="code-dots"><i /><i /><i /></span><span className="code-title">Example</span></div><span className="code-label">Python</span></div><pre><code>{block.code}</code></pre></div>)}</article>
    <div className="lesson-complete"><label><input type="checkbox" checked={Boolean(progress.lessons[lesson.id]?.completed)} onChange={() => progress.completeLesson(lesson.id)} /><strong>Mark this lesson complete</strong></label><span>Progress saves automatically</span></div>
    <div className="prev-next">
      {previous ? <button className="button secondary nav-button" onClick={() => navigate(`/modules/${previous.moduleId}/lessons/${previous.id}`)}><ArrowLeft size={16} /><span className="nav-button-text"><small>Previous</small><strong>{previous.title}</strong></span></button> : <span />}
      {next ? <button className="button primary nav-button next" onClick={() => navigate(`/modules/${next.moduleId}/lessons/${next.id}`)}><span className="nav-button-text"><small>Next</small><strong>{next.title}</strong></span><ArrowRight size={16} /></button> : <Link className="button primary nav-button next" to={`/modules/${module.id}/quiz`}><span className="nav-button-text"><small>Checkpoint</small><strong>Take module quiz</strong></span><ArrowRight size={16} /></Link>}
    </div>
  </section>;
}

function answerLabel(question: QuizQuestion, answer: Answer | undefined) {
  if (answer === undefined) return 'No answer';
  if (typeof answer === 'boolean') return answer ? 'True' : 'False';
  if (Array.isArray(answer)) return question.options?.filter((option) => answer.includes(option.id)).map((option) => option.label).join(', ') || 'No answer';
  return answer;
}

function QuizPage() {
  const { moduleId } = useParams();
  const quiz = getQuiz(moduleId!);
  const module = getModule(moduleId!);
  const progress = useProgress();
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<number>();
  const [error, setError] = useState('');
  if (!quiz || !module) return <Navigate to="/" />;
  const update = (question: QuizQuestion, answer: Answer) => { setError(''); setAnswers((current) => ({ ...current, [question.id]: answer })); };
  const submit = () => {
    const unanswered = quiz.questions.some((question) => {
      const answer = answers[question.id];
      return answer === undefined || (typeof answer === 'string' && answer.trim() === '') || (Array.isArray(answer) && answer.length === 0);
    });
    if (unanswered) { setError('Answer every question before submitting.'); return; }
    setError('');
    const score = scoreQuiz(answers, quiz.questions);
    setResult(score);
    progress.saveAttempt({ attemptId: crypto.randomUUID(), moduleId: module.id, quizId: quiz.id, answers, score, passed: isPassed(score, quiz.passScore), completedAt: new Date().toISOString() });
  };
  return <section className="page quiz-page">
    <Link className="back-link" to={`/modules/${module.id}`}><ArrowLeft size={15} />{module.title}</Link>
    <div className="quiz-head"><div><p className="eyebrow">Module checkpoint</p><h1>{quiz.title}</h1><p className="lede">Answer each question, then review the explanations. You need {quiz.passScore}% to pass.</p></div></div>
    {result === undefined ? <>
      <div className="questions">{quiz.questions.map((question, index) => <fieldset className="question" key={question.id}><legend><span>{index + 1}</span>{question.prompt}</legend>{question.type === 'short_text' ? <input className="text-input" value={String(answers[question.id] ?? '')} onChange={(event) => update(question, event.target.value)} placeholder="Type your answer" /> : question.type === 'true_false' ? <div className="options" role="radiogroup">{[true, false].map((value) => <label key={String(value)} className="option"><input type="radio" name={question.id} checked={answers[question.id] === value} onChange={() => update(question, value)} />{value ? 'True' : 'False'}</label>)}</div> : <div className="options">{question.options?.map((option) => <label className="option" key={option.id}><input type={question.type === 'multiple' ? 'checkbox' : 'radio'} name={question.id} checked={selectedIds(answers[question.id]).includes(option.id)} onChange={(event) => { const current = selectedIds(answers[question.id]); update(question, question.type === 'multiple' ? (event.target.checked ? [...current, option.id] : current.filter((id) => id !== option.id)) : [option.id]); }} />{option.label}</label>)}</div>}</fieldset>)}</div>
      {error && <div className="quiz-error" role="alert"><AlertCircle size={16} />{error}</div>}
      <button className="button primary" onClick={submit} disabled={Object.keys(answers).length < quiz.questions.length}>Submit answers<ArrowRight size={16} /></button>
    </> : <QuizResult quiz={quiz} answers={answers} score={result} onRetry={() => { setAnswers({}); setResult(undefined); setError(''); }} />}
  </section>;
}

function QuizResult({ quiz, answers, score, onRetry }: { quiz: NonNullable<ReturnType<typeof getQuiz>>; answers: Record<string, Answer>; score: number; onRetry: () => void }) {
  const passed = score >= quiz.passScore;
  return <div className={`result ${passed ? 'passed' : 'failed'}`} aria-live="polite">
    <span className="result-icon">{passed ? <Award size={26} /> : <RotateCcw size={26} />}</span>
    <strong>{passed ? 'Checkpoint passed!' : 'Keep practicing'}</strong>
    <div className="score">{score}%</div>
    <div className="pass-mark">Pass mark · {quiz.passScore}%</div>
    <p>{passed ? 'Great work. Your module progress is now up to date.' : `You need ${quiz.passScore}%. Review the lessons and try again.`}</p>
    <div className="review-list">{quiz.questions.map((question) => { const correct = scoreQuiz({ [question.id]: answers[question.id] }, [question]) === 100; return <div className={`review-item ${correct ? 'correct' : 'incorrect'}`} key={question.id}><strong>{correct ? <Check size={16} /> : <X size={16} />}<span>{question.prompt}</span></strong><small>Your answer: {answerLabel(question, answers[question.id])}</small><small>{question.explanation}</small></div>; })}</div>
    <div className="result-actions"><button className="button secondary" onClick={onRetry}><RotateCcw size={15} />Try again</button><Link className="button primary" to={`/modules/${quiz.moduleId}`}>Back to module<ArrowRight size={15} /></Link></div>
  </div>;
}

function Settings() {
  const progress = useProgress();
  const [message, setMessage] = useState('');
  const exportProgress = () => { const blob = new Blob([serializeProgress(progress)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'pycourse-progress.json'; link.click(); URL.revokeObjectURL(url); setMessage('Progress backup downloaded.'); };
  const importProgress = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; void file.text().then((raw) => { const imported = parseProgress(raw, course.id); progress.importProgress(imported); setMessage('Progress imported successfully.'); }).catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'That file could not be imported.')); };
  return <section className="page settings">
    <p className="eyebrow">Preferences</p>
    <h1>Settings</h1>
    <div className="settings-card"><h2><span className="settings-icon"><Monitor size={18} /></span>Appearance</h2><p>Choose how PyCourse should look on this device. Your choice is saved automatically.</p><ThemeControl labeled /></div>
    <div className="settings-card"><h2><span className="settings-icon"><Download size={18} /></span>Your progress</h2><p>Progress is stored locally in your browser. Export a backup before clearing site data.</p><div className="actions"><button className="button secondary" onClick={exportProgress}><Download size={15} />Download progress JSON</button><label className="button ghost"><Upload size={15} />Import progress JSON<input className="visually-hidden" type="file" accept="application/json" onChange={importProgress} /></label></div>{message && <p className="settings-status" role="status">{message}</p>}</div>
  </section>;
}

function PdfPage() {
  return <section className="page print-page"><button className="button primary no-print" onClick={() => window.print()}>Print / Save PDF</button><h1>{course.title}</h1><p>{course.description}</p>{modules.map((module) => <section key={module.id}><h2>{module.title}</h2>{module.lessons.map((item) => { const lesson = getLesson(item.id) as ParsedLesson; return <article key={item.id}><h3>{lesson.title}</h3>{lesson.blocks.map((block, index) => block.type === 'text' ? <div key={index}>{renderText(block.value)}</div> : <pre key={index}>{block.code}</pre>)}</article>; })}</section>)}</section>;
}

export default function App() {
  const resume = useProgress((state) => state.lastVisitedLessonId);
  const resumeLesson = lessons.find((lesson) => lesson.id === resume);
  return <Layout><Routes><Route path="/" element={<Overview />} /><Route path="/modules/:moduleId" element={<ModulePage />} /><Route path="/modules/:moduleId/lessons/:lessonId" element={<LessonPage />} /><Route path="/modules/:moduleId/quiz" element={<QuizPage />} /><Route path="/settings" element={<Settings />} /><Route path="/export/pdf" element={<PdfPage />} /><Route path="/resume" element={resumeLesson ? <Navigate to={`/modules/${resumeLesson.moduleId}/lessons/${resumeLesson.id}`} replace /> : <Navigate to="/" replace />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></Layout>;
}