import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AccountDashboardTransition } from '../../../src/components/account/AccountDashboardTransition';
import { DlavieAvatar } from '../../../src/components/account/DlavieAvatar';
import { VerifiedBadge } from '../../../src/components/account/VerifiedBadge';
import { SvgIcon } from '../../../src/components/ui/SvgIcon';
import { calculateDlavieCardValidity } from '../../../src/lib/account/cardValidity';
import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from '../../../src/lib/supabase/url';
import { DLAVIE_ACCESS_COOKIE, type DlavieSupabaseUser } from '../../../src/lib/supabase/session';

export const metadata = {
  title: 'Dashboard — DLavie Account',
  description: 'Manage your DLavie Account card, products, and workspace identity.',
};

async function getDashboardUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(DLAVIE_ACCESS_COOKIE)?.value;

  if (!accessToken) return null;

  const headers = getSupabaseRequestHeaders();
  headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(getSupabaseAuthEndpoint('/user'), {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) return null;

  try {
    return await response.json() as DlavieSupabaseUser;
  } catch {
    return null;
  }
}

function getStringMetadata(user: DlavieSupabaseUser, key: string, fallback: string) {
  const value = user.user_metadata?.[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function formatAccountId(userId: string) {
  const compact = userId.replace(/[^a-z0-9]/gi, '').toUpperCase().padEnd(8, '0');
  return `DLV-${compact.slice(0, 4)}-${compact.slice(-4)}`;
}

function formatDate(date: Date | null) {
  if (!date) return 'Awaiting activation date';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
}

function formatProductInterest(value: string) {
  const labels: Record<string, string> = {
    commerce: 'DLavie Commerce',
    ai: 'DLavie AI',
    automation: 'Automation Ecosystem',
    all: 'Full DLavie Ecosystem',
  };
  return labels[value] ?? value;
}

function AccountMenu() {
  return (
    <details className="account-action-menu">
      <summary aria-label="Open DLavie Account menu">
        <span />
        <span />
        <span />
      </summary>
      <div className="account-action-menu__panel">
        <Link href="/account/card">Manage Card</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/faq">DLavieOS</Link>
        <Link href="/faq">DLavie AI</Link>
        <Link href="/faq">Commerce</Link>
        <form action="/api/account/logout" method="post">
          <button type="submit">Logout</button>
        </form>
      </div>
    </details>
  );
}

export default async function AccountDashboardPage() {
  const user = await getDashboardUser();

  if (!user) {
    redirect('/account/login');
  }

  const fullName = getStringMetadata(user, 'full_name', 'DLavie Member');
  const productInterest = formatProductInterest(getStringMetadata(user, 'product_interest', 'Full DLavie Ecosystem'));
  const validity = calculateDlavieCardValidity(user.created_at);
  const accountId = formatAccountId(user.id);
  const statusText = validity.status === 'active' ? 'Active' : validity.statusLabel;

  return (
    <main className="account-shell account-dashboard-shell">
      <AccountDashboardTransition />
      <section className="account-dashboard account-dashboard--card" aria-labelledby="dashboard-title">
        <header className="account-dashboard__header account-dashboard__header--actions">
          <Link className="account-brand" href="/" aria-label="Back to DLavie home">
            <SvgIcon name="brand" />
            <span>DLAVIE</span>
          </Link>
          <nav className="account-dashboard__topnav account-dashboard__topnav--minimal" aria-label="Account dashboard navigation">
            <Link href="/">Back to Website</Link>
            <AccountMenu />
          </nav>
        </header>

        <article className="dlavie-card" aria-labelledby="dashboard-title">
          <div className="dlavie-card__ambient" aria-hidden="true" />
          <div className="dlavie-card__intro dlavie-card__intro--compact">
            <p className="account-panel__kicker">DLavie Account</p>
            <h1 id="dashboard-title">DLavie Card</h1>
            <p>Your connected identity across the DLavie ecosystem</p>
          </div>

          <div className="dlavie-card__profile dlavie-card__profile--hero">
            <DlavieAvatar seedSource={user.id || user.email || fullName} name={fullName} tier="standard" />
            <div className="dlavie-card__identity">
              <div className="dlavie-card__name-row">
                <h2>{fullName}</h2>
                <VerifiedBadge />
              </div>
              <p>{user.email}</p>
              <span>{accountId}</span>
            </div>
          </div>

          <dl className="dlavie-card__details dlavie-card__details--compact">
            <div>
              <dt>Status</dt>
              <dd>{statusText}</dd>
            </div>
            <div>
              <dt>Tier</dt>
              <dd>Standard</dd>
            </div>
            <div>
              <dt>Card validity</dt>
              <dd>{validity.accessLabel}</dd>
            </div>
            <div>
              <dt>Expires</dt>
              <dd>{formatDate(validity.expiresAt)}</dd>
            </div>
            <div>
              <dt>Product interest</dt>
              <dd>{productInterest}</dd>
            </div>
          </dl>

          <div className="dlavie-card__footer">
            <p>Expired cards may limit access until renewed. Blacklist is reserved only for abuse, fraud, spam, or policy violations.</p>
            <div>
              <Link href="/account/card">Manage Card</Link>
              <Link href="/faq">View FAQ</Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
