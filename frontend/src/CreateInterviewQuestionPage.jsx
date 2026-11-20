import { useState } from 'react'

const questionCounts = [2, 5, 10]

function CreateInterviewQuestionPage({ onQuiz, request, navigate }) {
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [apiKeyConfirmed, setApiKeyConfirmed] = useState(false)
  const [jobType, setJobType] = useState('')
  const [subjects, setSubjects] = useState([])
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [loadingQuestionCount, setLoadingQuestionCount] = useState(null)
  const [error, setError] = useState('')

  const confirmApiKey = (event) => {
    event.preventDefault()
    const trimmedApiKey = geminiApiKey.trim()
    if (!trimmedApiKey) {
      setError('Enter your Gemini API key to continue.')
      return
    }
    if (!/^[\x21-\x7E]+$/.test(trimmedApiKey)) {
      setError('Paste the API key directly from Google AI Studio without spaces or special Unicode characters.')
      return
    }

    setGeminiApiKey(trimmedApiKey)
    setApiKeyConfirmed(true)
    setError('')
  }

  const updateApiKey = (value) => {
    setGeminiApiKey(value)
    setApiKeyConfirmed(false)
    setJobType('')
    setSubjects([])
    setSelectedSubjects([])
    setError('')
  }

  const findSubjects = async (event) => {
    event.preventDefault()
    const trimmedJobType = jobType.trim()
    if (!trimmedJobType) {
      setError('Enter the job you are applying for.')
      return
    }

    setError('')
    setSubjects([])
    setSelectedSubjects([])
    setLoadingSubjects(true)

    try {
      const result = await request('/api/quizzes/subjects', {
        method: 'POST',
        body: JSON.stringify({ jobType: trimmedJobType, apiKey: geminiApiKey }),
      })
      if (
        !Array.isArray(result.subjects) ||
        result.subjects.length < 3 ||
        result.subjects.some((subject) => typeof subject !== 'string' || !subject.trim())
      ) {
        throw new Error('Could not load a valid subject list. Please try again.')
      }
      setSubjects(result.subjects)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoadingSubjects(false)
    }
  }

  const updateJobType = (value) => {
    setJobType(value)
    setSubjects([])
    setSelectedSubjects([])
    setError('')
  }

  const toggleAllSubjects = () => {
    setSelectedSubjects((current) => (
      current.length === subjects.length ? [] : subjects
    ))
  }

  const toggleSubject = (subject) => {
    setSelectedSubjects((current) => (
      current.includes(subject)
        ? current.filter((selectedSubject) => selectedSubject !== subject)
        : [...current, subject]
    ))
  }

  const createInterviewQuiz = async (questionCount) => {
    setError('')
    setLoadingQuestionCount(questionCount)

    try {
      const quiz = await request('/api/quizzes/generate', {
        method: 'POST',
        body: JSON.stringify({
          jobType: jobType.trim(),
          subjects: selectedSubjects,
          questionCount,
          apiKey: geminiApiKey,
        }),
      })
      onQuiz(quiz)
      navigate('/quiz')
    } catch (requestError) {
      setError(requestError.message)
      setLoadingQuestionCount(null)
    }
  }

  const allSubjectsSelected = subjects.length > 0 && selectedSubjects.length === subjects.length
  const canCreateQuiz = selectedSubjects.length > 0 && loadingQuestionCount === null

  return (
    <section className="generator-page interview-page">
      <div className="interview-heading">
        <p className="eyebrow"><span className="eyebrow-dot" /> Your next opportunity starts here</p>
        <h1>Get ready to<br /><em>shine.</em></h1>
        <p className="hero-text">Add your AI key, choose a role, and practice the skills that matter.</p>
      </div>

      <form className="job-type-form interview-card api-key-card" onSubmit={confirmApiKey}>
        <div className="step-heading">
          <span className="step-number">01</span>
          <div>
            <h2>Add your Gemini API key</h2>
            <p>Your key is used for AI generation and is not saved by this app.</p>
          </div>
        </div>
        <div className="job-search-row">
          <input
            autoFocus
            id="gemini-api-key"
            name="geminiApiKey"
            type="password"
            autoComplete="off"
            required
            value={geminiApiKey}
            onChange={(event) => updateApiKey(event.target.value)}
            placeholder="Paste your Gemini API key"
            maxLength="256"
            aria-label="Gemini API key"
          />
          <button className="button button-dark" disabled={!geminiApiKey.trim()}>
            Continue ↗
          </button>
        </div>
        <button
          className="api-key-procedure-link"
          type="button"
          onClick={() => navigate('/api-key-procedure')}
        >
          Need help? Read the API key procedure ↗
        </button>
      </form>

      {apiKeyConfirmed && (
        <form className="job-type-form interview-card" onSubmit={findSubjects}>
          <div className="step-heading">
            <span className="step-number">02</span>
            <div>
              <h2>Which type of job are you applying for?</h2>
              <p>We’ll find the key subjects for your interview.</p>
            </div>
          </div>
          <div className="job-search-row">
            <input
              id="job-type"
              name="jobType"
              type="search"
              value={jobType}
              disabled={loadingSubjects || loadingQuestionCount !== null}
              onChange={(event) => updateJobType(event.target.value)}
              placeholder="e.g. Product Manager"
              maxLength="100"
              aria-label="Job you are applying for"
            />
            <button className="button button-dark" disabled={loadingSubjects || loadingQuestionCount !== null}>
              {loadingSubjects ? 'Finding subjects…' : 'Find my subjects ↗'}
            </button>
          </div>
        </form>
      )}

      {subjects.length > 0 && (
        <>
          <section className="interview-card subject-card">
            <div className="step-heading">
              <span className="step-number">03</span>
              <div>
                <h2>Which subjects would you like to be an expert in?</h2>
                <p>Select the skills you want to practice for {jobType.trim()}.</p>
              </div>
            </div>

            <label className="select-all-option">
              <input
                type="checkbox"
                checked={allSubjectsSelected}
                disabled={loadingQuestionCount !== null}
                onChange={toggleAllSubjects}
              />
              <span>I want to be an expert in all these subjects</span>
            </label>

            <div className="subject-grid">
              {subjects.map((subject, index) => (
                <label className="subject-option" key={subject}>
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject)}
                    disabled={loadingQuestionCount !== null}
                    onChange={() => toggleSubject(subject)}
                  />
                  <span className="subject-number">{String(index + 1).padStart(2, '0')}</span>
                  <span>{subject}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="interview-card question-count-card">
            <div className="step-heading">
              <span className="step-number">04</span>
              <div>
                <h2>How many questions do you need?</h2>
                <p>Choose a set to start your interview practice.</p>
              </div>
            </div>
            <div className="question-count-options">
              {questionCounts.map((count) => (
                <button
                  className="question-count-option"
                  type="button"
                  key={count}
                  disabled={!canCreateQuiz}
                  onClick={() => createInterviewQuiz(count)}
                >
                  <strong>{count}</strong>
                  <span>questions</span>
                  {loadingQuestionCount === count && <small>Creating…</small>}
                </button>
              ))}
            </div>
            {!selectedSubjects.length && (
              <p className="selection-hint">Select at least one subject to continue.</p>
            )}
          </section>
        </>
      )}

      {error && <p className="error interview-error">{error}</p>}
    </section>
  )
}

export default CreateInterviewQuestionPage
