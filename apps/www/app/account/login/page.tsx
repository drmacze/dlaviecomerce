import Link from 'next/link';
import { SvgIcon } from '../../../src/components/ui/SvgIcon';

export const metadata = {
  title: 'Login — DLavie Account',
  description: 'Access your DLavie Account for AI, commerce, and automation products.',
};

export default function LoginPage() {
  return (
    <main className="account-shell">
      <section className="account-card" aria-labelledby="account-title">
        <aside className="account-visual">
          <Link className="account-brand" href="/" aria-label="Back to DLavie home">
            <SvgIcon name="brand" />
            <span>DLAVIE</span>
          </Link>
          <h1>DLavie Account</h1>
          <p>One identity for DLavieOS, AI Agent access, commerce rails, PPOB operations, and automation workflows.</p>
          <div className="account-signal" aria-hidden="true">
            <span><b>AI</b><em>Ready</em></span>
            <span><b>Commerce</b><em>Secure</em></span>
            <span><b>Automation</b><em>Online</em></span>
          </div>
        </aside>

        <section className="account-panel">
          <p className="account-panel__kicker">Secure access</p>
          <h2 id="account-title">Login</h2>
          <p className="account-panel__copy">Masuk ke DLavie Account untuk mengelola akses produk, workspace, dan layanan DLavie yang terhubung.</p>

          <form className="account-form">
            <label className="account-field">
              <span>Email</span>
              <input type="email" name="email" autoComplete="email" placeholder="you@company.com" required />
            </label>
            <label className="account-field">
              <span>Password</span>
              <input type="password" name="password" autoComplete="current-password" placeholder="••••••••" required />
            </label>
            <button className="account-submit" type="submit">Continue to account</button>
          </form>

          <p className="account-switch">Belum punya akun? <Link href="/account/register">Create DLavie Account</Link></p>
          <p className="account-note">Authentication backend belum diaktifkan. Halaman ini menyiapkan UI dan route resmi untuk DLavie Account.</p>
        </section>
      </section>
    </main>
  );
}
