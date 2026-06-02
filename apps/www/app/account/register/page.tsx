import Link from 'next/link';
import { SvgIcon } from '../../../src/components/ui/SvgIcon';

export const metadata = {
  title: 'Register — DLavie Account',
  description: 'Create a DLavie Account for AI, commerce, and automation products.',
};

export default function RegisterPage() {
  return (
    <main className="account-shell">
      <section className="account-card" aria-labelledby="account-title">
        <aside className="account-visual">
          <Link className="account-brand" href="/" aria-label="Back to DLavie home">
            <SvgIcon name="brand" />
            <span>DLAVIE</span>
          </Link>
          <h1>Start with DLavie</h1>
          <p>Create one account for AI agents, commerce operations, PPOB rails, and the DLavie automation ecosystem.</p>
          <div className="account-signal" aria-hidden="true">
            <span><b>Identity</b><em>Unified</em></span>
            <span><b>Workspace</b><em>Ready</em></span>
            <span><b>Systems</b><em>Connected</em></span>
          </div>
        </aside>

        <section className="account-panel">
          <p className="account-panel__kicker">Create access</p>
          <h2 id="account-title">Register</h2>
          <p className="account-panel__copy">Buat DLavie Account untuk menyiapkan identitas resmi sebelum mengaktifkan produk AI, Commerce, dan Automation.</p>

          <form className="account-form">
            <label className="account-field">
              <span>Full name</span>
              <input type="text" name="name" autoComplete="name" placeholder="Your name" required />
            </label>
            <label className="account-field">
              <span>Email</span>
              <input type="email" name="email" autoComplete="email" placeholder="you@company.com" required />
            </label>
            <label className="account-field">
              <span>Product interest</span>
              <select name="interest" defaultValue="commerce">
                <option value="commerce">DLavie Commerce</option>
                <option value="ai">DLavie AI</option>
                <option value="automation">Automation Ecosystem</option>
                <option value="all">Full DLavie Ecosystem</option>
              </select>
            </label>
            <label className="account-field">
              <span>Password</span>
              <input type="password" name="password" autoComplete="new-password" placeholder="Create password" required />
            </label>
            <button className="account-submit" type="submit">Create account</button>
          </form>

          <p className="account-switch">Sudah punya akun? <Link href="/account/login">Login to DLavie Account</Link></p>
          <p className="account-note">Authentication backend belum diaktifkan. Halaman ini menyiapkan UI dan route resmi untuk DLavie Account.</p>
        </section>
      </section>
    </main>
  );
}
