const preparationSteps = [
  {
    number: '01',
    title: 'Role-focused questions',
    description: 'Enter the role you are applying for to discover relevant interview subjects.',
  },
  {
    number: '02',
    title: 'Your skills, your plan',
    description: 'Choose the subjects you want to strengthen, or select them all.',
  },
  {
    number: '03',
    title: 'Flexible practice',
    description: 'Generate a short or longer practice set: 2, 5, or 10 questions at a time.',
  },
  {
    number: '04',
    title: 'Learn from attempts',
    description: 'Save results, track past practice, and revisit questions you missed.',
  },
]

const teamMembers = [
  {
    name: 'Omar Abdullah Saeed Mohammed',
    role: 'Frontend Developer',
    description: 'Focused on building a clear, responsive experience for interview practice.',
    phone: '7842361103',
    phoneLink: 'tel:7842361103',
  },
  {
    name: 'Mohammed Abdullah Saeed Mohammed',
    role: 'Backend & API Integration',
    description: 'Connected question generation and user progress to the app.',
    phone: '9866451420',
    phoneLink: 'tel:9866451420',
  },
  {
    name: 'Mohammed Rashed',
    role: 'UI/UX Designer',
    description: 'Made each step of preparation simple and easy to follow.',
    phone: '+91 6281 661 214',
    phoneLink: 'tel:+916281661214',
  },
  {
    name: 'Mohammed Hamza',
    role: 'Content & Testing',
    description: 'Helped shape practice content and check the app experience.',
    phone: '+91 90630 55981',
    phoneLink: 'tel:+919063055981',
  },
]

const technologies = ['React', 'Vite', 'Node.js', 'Express', 'MongoDB', 'Google Gemini API']

function AboutPage({ navigate }) {
  return (
    <section className="about-page">
      <div className="about-hero">
        <div className="about-hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> A smarter way to prepare</p>
          <h1>Meet <em className="home-highlight">Interview Questions Maker.</em></h1>
          <p className="hero-text">
            Turn interview preparation into focused practice. Build confidence with
            role-focused questions based on the subjects you choose.
          </p>
          <div className="about-hero-actions">
            <button className="button button-dark" onClick={() => navigate('/generate')}>
              Start practicing ↗
            </button>
            <button className="button button-light" onClick={() => navigate('/api-key-procedure')}>
              How to get an API key
            </button>
          </div>
        </div>

        <div className="about-visual" aria-hidden="true">
          <p className="eyebrow">YOUR PREPARATION PLAN</p>
          <div className="about-visual-step"><span>01</span><b>Choose a role</b><i>✓</i></div>
          <div className="about-visual-step"><span>02</span><b>Pick your subjects</b><i>✓</i></div>
          <div className="about-visual-step"><span>03</span><b>Practice questions</b><i>✦</i></div>
          <div className="about-visual-orb">✦</div>
        </div>
      </div>

      <section className="about-section">
        <div className="about-section-heading">
          <p className="eyebrow">How it works</p>
          <h2>Preparation shaped around <em>you.</em></h2>
        </div>
        <div className="about-steps-grid">
          {preparationSteps.map((step) => (
            <article className="about-step-card" key={step.number}>
              <span className="about-step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section about-team-section">
        <div className="about-section-heading">
          <p className="eyebrow">The people behind it</p>
          <h2>A team with a shared <em>goal.</em></h2>
          <p className="about-section-intro">
            We worked together to make interview preparation feel clear, personal, and easy to repeat.
          </p>
        </div>
        <div className="about-team-grid">
          {teamMembers.map((member, index) => (
            <article className="about-team-card" key={member.name}>
              <span className="about-member-number">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="about-member-name">{member.name}</h3>
              <p className="about-member-role">{member.role}</p>
              <p className="about-member-description">{member.description}</p>
              <p className="about-member-contact">
                Contact: <a href={member.phoneLink}>{member.phone}</a>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-details">
        <article className="about-purpose-card">
          <p className="eyebrow">Built for practical prep</p>
          <h2>Make every practice session <em>count.</em></h2>
          <p>
            A focused interview-practice project designed to make preparation feel clear,
            personal, and easy to repeat.
          </p>
        </article>
        <article className="about-tech-card">
          <p className="eyebrow">Tech stack</p>
          <h2>Made with modern tools.</h2>
          <div className="about-tech-list">
            {technologies.map((technology) => (
              <span key={technology}>{technology}</span>
            ))}
          </div>
        </article>
      </section>

      <section className="about-cta">
        <p className="eyebrow">Ready to practice?</p>
        <h2>Start with a role. Leave with more confidence.</h2>
        <p>Choose your subjects and make your next practice session count.</p>
        <button className="button button-dark" onClick={() => navigate('/generate')}>
          Create interview questions ↗
        </button>
      </section>
    </section>
  )
}

export default AboutPage
