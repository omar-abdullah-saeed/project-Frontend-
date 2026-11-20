import { useCallback, useEffect, useMemo, useState } from 'react'
import CloudShader from './CloudShader.jsx'
import AboutPage from './AboutPage.jsx'
import ApiKeyProcedurePage from './ApiKeyProcedurePage.jsx'
import CreateInterviewQuestionPage from './CreateInterviewQuestionPage.jsx'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || ''
const TOKEN_KEY = 'quiz_generator_token'
const USER_KEY = 'quiz_generator_user'

const readStored = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}

const request = async (path, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY)
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'Something went wrong')
  return body
}

const navigate = (path) => {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function Logo() {
  return (
    <button className="brand" aria-label="Interview Questions Maker home" onClick={() => navigate('/')}>
      <img className="brand-logo" src="/interview-questions-maker-logo.png" alt="" />
      <span>Interview Questions Maker</span>
    </button>
  )
}

function Header({ user, onSignOut }) {
  return (
    <header className="site-header">
      <Logo />
      <nav>
        <button className="nav-link" onClick={() => navigate('/api-key-procedure')}>API key procedure</button>
        {user ? (
          <>
            <button className="nav-link" onClick={() => navigate('/generate')}>Create interview question</button>
            <button className="nav-link" onClick={() => navigate('/attempts')}>My attempts</button>
            <button className="nav-link" onClick={() => navigate('/try-again')}>Try again</button>
            <button className="nav-link" onClick={() => navigate('/about')}>About</button>
            <span className="user-pill">{user.username}</span>
            <button className="button button-quiet" onClick={onSignOut}>Sign out</button>
          </>
        ) : (
          <>
            <button className="nav-link" onClick={() => navigate('/about')}>About</button>
            <button className="nav-link" onClick={() => navigate('/signin')}>Sign in</button>
            <button className="button button-dark small" onClick={() => navigate('/signup')}>Get started</button>
          </>
        )}
      </nav>
    </header>
  )
}

function Shell({ children, user, onSignOut }) {
  return (
    <>
      <Header user={user} onSignOut={onSignOut} />
      <main>{children}</main>
      <footer>
        <span>Interview Questions Maker</span>
        <button className="footer-about-link" onClick={() => navigate('/about')}>About</button>
        <span>Prepare with confidence.</span>
      </footer>
    </>
  )
}

function Home({ user }) {
  return (
    <section className="home-page">
      <CloudShader />
      <div className="hero-copy">
        <p className="eyebrow"><span className="eyebrow-dot" /> Your interview prep starts here</p>
        <h1>Get interview-ready.<br /><em className="home-highlight">Practice with purpose.</em></h1>
        <p className="hero-text">Choose a role, focus on key skills, and practice with AI-generated interview questions.</p>
        <div className="hero-actions">
          <button className="button button-dark" onClick={() => navigate(user ? '/generate' : '/signup')}>Start interview prep <span>↗</span></button>
          <span className="microcopy">Bring your Gemini API key</span>
        </div>
      </div>
      <div className="feature-strip">
        <div><b>01</b><span>Choose your role</span><small>Tell us what job you want</small></div>
        <div><b>02</b><span>Select your subjects</span><small>Focus on the skills that matter</small></div>
        <div><b>03</b><span>Practice questions</span><small>Choose 2, 5, or 10 questions</small></div>
      </div>
    </section>
  )
}

function AuthPage({ mode, onAuth }) {
  const isSignup = mode === 'signup'
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = isSignup ? form : { email: form.email, password: form.password }
      const result = await request(`/api/auth/${isSignup ? 'signup' : 'signin'}`, { method: 'POST', body: JSON.stringify(body) })
      onAuth(result)
      navigate('/generate')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-intro">
        <p className="eyebrow auth-welcome"><span className="eyebrow-dot" /> Welcome to Interview Questions Maker</p>
        <h1>
          {isSignup ? (
            <>
              Turn curiosity into<br />
              <em className="auth-greeting">real progress.</em>
            </>
          ) : (
            <em className="auth-greeting">Good to see<br />you again.</em>
          )}
        </h1>
        <p>Small steps. Better questions.<br />A sharper you.</p>
      </div>
      <form className="auth-card" onSubmit={submit}>
        <div><p className="eyebrow">Your account</p><h2>{isSignup ? 'Create your account' : 'Sign in to continue'}</h2><p className="muted">{isSignup ? 'Start your learning journey in under a minute.' : 'Your next great question is waiting.'}</p></div>
        {isSignup && <label>Username<input required minLength="2" maxLength="30" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="alex" /></label>}
        <label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
        <label>Password<input required minLength="8" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" /></label>
        {error && <p className="error">{error}</p>}
        <button className="button button-dark full" disabled={loading}>{loading ? 'Please wait…' : isSignup ? 'Create account ↗' : 'Sign in ↗'}</button>
        <p className="form-switch">{isSignup ? 'Already have an account?' : 'New to Interview Questions Maker?'} <button type="button" onClick={() => navigate(isSignup ? '/signin' : '/signup')}>{isSignup ? 'Sign in' : 'Create one'}</button></p>
      </form>
    </section>
  )
}

function QuizPage({ quiz, onSubmitted }) {
  const [answers, setAnswers] = useState(() => Array(quiz.questions.length).fill(''))
  const [seconds, setSeconds] = useState(600)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const submit = useCallback(async () => {
    if (submitting || submitted) return
    setSubmitting(true)
    const finalScore = quiz.questions.reduce((total, question, index) => total + (answers[index] === question.correctOption ? 1 : 0), 0)
    try {
      await request('/api/quizzes/attempts', { method: 'POST', body: JSON.stringify({ topic: quiz.topic, questions: quiz.questions, answers, score: finalScore }) })
      setScore(finalScore)
      setSubmitted(true)
      onSubmitted()
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }, [answers, onSubmitted, quiz, submitted, submitting])

  useEffect(() => {
    if (seconds <= 0) {
      const timeout = window.setTimeout(submit, 0)
      return () => window.clearTimeout(timeout)
    }
    const timer = setInterval(() => setSeconds((value) => value - 1), 1000)
    return () => clearInterval(timer)
  }, [seconds, submit])

  const formattedTime = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  if (submitted) return <section className="result-page"><div className="result-orb">✦</div><p className="eyebrow">Quiz complete</p><h1>You scored <em>{score}/{quiz.questions.length}</em></h1><p className="hero-text">Nice work. Every attempt is another step forward.</p><div className="result-actions"><button className="button button-dark" onClick={() => navigate('/generate')}>Try another topic ↗</button><button className="button button-light" onClick={() => navigate('/attempts')}>View attempts</button></div></section>

  return <section className="quiz-page"><div className="quiz-top"><div><p className="eyebrow"><span className="eyebrow-dot" /> Your quiz</p><h1>{quiz.topic}</h1></div><div className={`timer ${seconds < 60 ? 'urgent' : ''}`}><span>◷</span>{formattedTime}<small>remaining</small></div></div><div className="progress"><span style={{ width: `${(answers.filter(Boolean).length / quiz.questions.length) * 100}%` }} /></div><div className="question-list">{quiz.questions.map((question, index) => <article className="question-card" key={`${question.question}-${index}`}><div className="question-number">0{index + 1}</div><div className="question-body"><p>{question.question}</p><div className="options">{['option1', 'option2', 'option3', 'option4'].map((option) => <label className={answers[index] === option ? 'selected' : ''} key={option}><input type="radio" name={`question-${index}`} checked={answers[index] === option} onChange={() => setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? option : answer))} /><span>{question[option]}</span><b>{String.fromCharCode(65 + Number(option.slice(-1)) - 1)}</b></label>)}</div></div></article>)}</div>{error && <p className="error">{error}</p>}<div className="quiz-submit"><span>{answers.filter(Boolean).length} of {quiz.questions.length} answered</span><button className="button button-dark" onClick={submit} disabled={submitting}>{submitting ? 'Saving…' : 'Submit quiz ↗'}</button></div></section>
}

function Attempts() {
  const [attempts, setAttempts] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { request('/api/quizzes/attempts').then(setAttempts).catch((err) => setError(err.message)) }, [])
  return <section className="attempts-page"><div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-dot" /> Your progress</p><h1>Past <em>attempts.</em></h1></div><div className="attempts-actions"><button className="button button-light" onClick={() => navigate('/try-again')}>Review wrong answers</button><button className="button button-dark" onClick={() => navigate('/generate')}>New quiz ↗</button></div></div>{error && <p className="error">{error}</p>}{attempts.length === 0 && !error ? <div className="empty-state"><div>✦</div><h2>No attempts yet</h2><p>Your first quiz is just a question away.</p><button className="button button-light" onClick={() => navigate('/generate')}>Create your first quiz</button></div> : <div className="attempt-grid">{attempts.map((attempt) => <article className="attempt-card" key={attempt._id}><div className="attempt-icon">✦</div><div><h3>{attempt.topic}</h3><p>{new Date(attempt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · {attempt.questions.length} questions</p></div><strong>{attempt.score}<small> / {attempt.questions.length}</small></strong></article>)}</div>}</section>
}

function TryAgain() {
  const [attempts, setAttempts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    request('/api/quizzes/attempts')
      .then(setAttempts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const wrongAnswers = attempts.flatMap((attempt) =>
    attempt.questions.flatMap((question, index) =>
      attempt.answers[index] !== question.correctOption
        ? [{
            id: `${attempt._id}-${index}`,
            topic: attempt.topic,
            question,
            selectedOption: attempt.answers[index],
            questionNumber: index + 1,
          }]
        : []
    )
  )

  return (
    <section className="retry-page">
      <div className="retry-heading">
        <p className="eyebrow"><span className="eyebrow-dot" /> Learn from every attempt</p>
        <h1>TRY <em>AGAIN</em></h1>
        <p className="hero-text">Review the questions you missed and see the correct answers.</p>
      </div>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="retry-status">Loading your missed questions…</p>
      ) : error ? null : wrongAnswers.length === 0 ? (
        <div className="empty-state">
          <div>✦</div>
          <h2>Nothing to retry</h2>
          <p>You haven’t missed any questions yet. Keep up the great work!</p>
          <button className="button button-dark" onClick={() => navigate('/generate')}>Create a quiz ↗</button>
        </div>
      ) : (
        <div className="retry-list">
          {wrongAnswers.map((item) => (
            <article className="retry-card" key={item.id}>
              <p className="retry-topic">{item.topic} <span>Question {item.questionNumber}</span></p>
              <h2>{item.question.question}</h2>
              <p className="retry-answer incorrect"><span>Your answer</span>{item.question[item.selectedOption]}</p>
              <p className="retry-answer correct"><span>Correct answer</span>{item.question[item.question.correctOption]}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [user, setUser] = useState(() => readStored(USER_KEY))
  const [quiz, setQuiz] = useState(null)
  useEffect(() => { const onPop = () => setPath(window.location.pathname); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, [])

  const onAuth = (result) => { localStorage.setItem(TOKEN_KEY, result.token); localStorage.setItem(USER_KEY, JSON.stringify(result.user)); setUser(result.user) }
  const signOut = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setUser(null); navigate('/') }
  const protectedPage = ['/generate', '/quiz', '/attempts', '/try-again'].includes(path)
  const page = useMemo(() => {
    if (protectedPage && !user) return <AuthPage mode="signin" onAuth={onAuth} />
    if (path === '/about') return <AboutPage navigate={navigate} />
    if (path === '/api-key-procedure') return <ApiKeyProcedurePage navigate={navigate} />
    if (path === '/signup') return <AuthPage mode="signup" onAuth={onAuth} />
    if (path === '/signin') return <AuthPage mode="signin" onAuth={onAuth} />
    if (path === '/generate') return <CreateInterviewQuestionPage onQuiz={setQuiz} request={request} navigate={navigate} />
    if (path === '/quiz' && quiz) return <QuizPage quiz={quiz} onSubmitted={() => {}} />
    if (path === '/quiz') return <CreateInterviewQuestionPage onQuiz={setQuiz} request={request} navigate={navigate} />
    if (path === '/attempts') return <Attempts />
    if (path === '/try-again') return <TryAgain />
    return <Home user={user} />
  }, [path, protectedPage, user, quiz])

  return <Shell user={user} onSignOut={signOut}>{page}</Shell>
}

export default App

