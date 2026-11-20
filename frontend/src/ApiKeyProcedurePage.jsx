function ApiKeyProcedurePage({ navigate }) {
  return (
    <section className="api-key-procedure">
      <button className="button button-light procedure-back" onClick={() => navigate('/generate')}>
        ← Back to interview setup
      </button>

      <header className="procedure-heading">
        <p className="eyebrow"><span className="eyebrow-dot" /> Gemini setup guide</p>
        <h1>Procedure for <em>API key</em></h1>
        <p className="hero-text">
          Follow these steps to create a Gemini API key in Google AI Studio.
        </p>
        <a
          className="button button-dark procedure-open-link"
          href="https://aistudio.google.com/"
          target="_blank"
          rel="noreferrer"
        >
          Open Google AI Studio ↗
        </a>
      </header>

      <section className="procedure-prerequisites">
        <h2>Before you begin</h2>
        <p>
          You’ll need a Google Account, a modern browser, and access to Google AI Studio.
          Availability, pricing, and usage limits can depend on your account and region.
        </p>
      </section>

      <ol className="procedure-steps">
        <li className="procedure-step">
          <span className="procedure-step-number">01</span>
          <div>
            <h2>Open AI Studio and sign in</h2>
            <p>
              Visit Google AI Studio and sign in with your Google Account. If prompted,
              review and accept the Google APIs Terms of Service.
            </p>
            <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer">
              aistudio.google.com ↗
            </a>
          </div>
        </li>

        <li className="procedure-step">
          <span className="procedure-step-number">02</span>
          <div>
            <h2>Go to API keys</h2>
            <p>
              In the AI Studio workspace, choose <strong>Get API key</strong> in the
              navigation to open the API keys page.
            </p>
          </div>
        </li>

        <li className="procedure-step">
          <span className="procedure-step-number">03</span>
          <div>
            <h2>Create a key</h2>
            <p>
              Select <strong>Create API key</strong>. You can create a key in a new
              project or choose an existing Google Cloud project, then wait for the key
              to be created.
            </p>
          </div>
        </li>

        <li className="procedure-step">
          <span className="procedure-step-number">04</span>
          <div>
            <h2>Copy and protect it</h2>
            <p>
              Copy the key and store it in a password manager or another secure place.
              Treat it like a password; never share it publicly or commit it to source
              control.
            </p>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
              Open the API keys page ↗
            </a>
          </div>
        </li>
      </ol>

      <aside className="procedure-security">
        <h2>Keep your key safe</h2>
        <p>
          This app sends the key you enter to its backend for Gemini requests and does
          not save it in app storage. Only enter it on a trusted, secure connection.
          If you manage the server, storing the key as a backend environment variable is
          the safer deployment option.
        </p>
      </aside>

      <section className="procedure-troubleshooting">
        <h2>Quick troubleshooting</h2>
        <div>
          <article>
            <h3>Create API key is disabled</h3>
            <p>Accept any pending terms and check whether your organization restricts AI Studio access.</p>
          </article>
          <article>
            <h3>Your key is lost or exposed</h3>
            <p>Revoke it from the API keys page and create a replacement key.</p>
          </article>
          <article>
            <h3>You reach a quota or rate limit</h3>
            <p>Check your project’s current usage and limits in AI Studio or Google Cloud.</p>
          </article>
        </div>
      </section>

      <button className="button button-dark procedure-return" onClick={() => navigate('/generate')}>
        Continue to API key entry ↗
      </button>
    </section>
  )
}

export default ApiKeyProcedurePage
