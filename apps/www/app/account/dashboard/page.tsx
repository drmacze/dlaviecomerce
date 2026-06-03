import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SvgIcon } from '../../../src/components/ui/SvgIcon';
import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from '../../../src/lib/supabase/url';
import { DLAVIE_ACCESS_COOKIE, type DlavieSupabaseUser } from '../../../src/lib/supabase/session';

export const metadata = {
  title: 'Dashboard — DLavie Account',
  description: 'Manage your DLavie Account access, products, and workspace identity.',
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

export default async function AccountDashboardPage() {
  const user = await getDashboardUser();

  if (!user) {
    redirect('/account/login');
  }

  const fullName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : 'DLavie member';
  const productInterest = typeof user.user_metadata?.product_interest === 'string' ? user.user_metadata.product_interest : 'full ecosystem';

  return (
    <main className="account-shell account-dashboard-shell">
      <section className="account-dashboard" aria-labelledby="dashboard-title">
        <header className="account-dashboard__header">
          <Link className="account-brand" href="/" aria-label="Back to DLavie home">
            <SvgIcon name="brand" />
            <span>DLAVIE</span>
          </Link>
          <form action="/api/account/logout" method="post">
            <button className="account-dashboard__logout" type="submit">Logout</button>
          </form>
        </header>

        <div className="account-dashboard__hero">
          <p className="account-panel__kicker">DLavie Account</p>
          <h1 id="dashboard-title">Welcome, {fullName}</h1>
          <p>{user.email}</p>
        </div>

        <div className="account-dashboard__grid">
          <article>
            <span>Workspace</span>
            <strong>Personal access</strong>
            <p>Your DLavie identity is active and ready to connect product workspaces.</p>
          </article>
          <article>
            <span>Product interest</span>
            <strong>{productInterest}</strong>
            <p>Use this signal to route onboarding toward AI, Commerce, or Automation flows.</p>
          </article>
          <article>
            <span>Security</span>
            <strong>Supabase Auth</strong>
            <p>Your session is protected by server-set HTTP-only DLavie account cookies.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
