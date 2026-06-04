import Link from 'next/link';

export function AiFinalCta() {
  return (
    <section className="dlavie-ai__section ai-final" aria-labelledby="ai-final-title" data-ai-final>
      <div data-ai-reveal>
        <p className="dlavie-ai__eyebrow">DLavie Intelligence Workspace</p>
        <h2 id="ai-final-title">Bring support, commerce, and operating agents into one premium AI surface.</h2>
        <p>Start with DLavie AI conversation mode, then graduate into DLavieOS Agent workflows as protected tools come online.</p>
        <div className="ai-final__actions">
          <Link className="ai-button ai-button--primary" href="/account/login">Start DLavie AI</Link>
          <a className="ai-button ai-button--secondary" href="#features">Review capabilities</a>
        </div>
      </div>
    </section>
  );
}
