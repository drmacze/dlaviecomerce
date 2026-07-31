import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ArrowUpRight, LogOut, ShoppingBag } from 'lucide-react';
import { DlavieBrand } from '../../../src/components/brand/DlavieBrand';
import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from '../../../src/lib/supabase/url';
import {
  DLAVIE_ACCESS_COOKIE,
  type DlavieSupabaseUser,
} from '../../../src/lib/supabase/session';

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
    return (await response.json()) as DlavieSupabaseUser;
  } catch {
    return null;
  }
}

export default async function AccountDashboardPage() {
  const user = await getDashboardUser();

  if (!user) {
    redirect('/account/login');
  }

  const fullName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : 'DLavie member';
  const productInterest =
    typeof user.user_metadata?.product_interest === 'string'
      ? user.user_metadata.product_interest
      : 'full ecosystem';

  return (
    <main className="account-shell account-dashboard-shell">
      <section className="account-dashboard" aria-labelledby="dashboard-title">
        <header className="account-dashboard__header">
          <Link className="account-brand" href="/" aria-label="Kembali ke beranda DLavie">
            <DlavieBrand product="Account" compact />
          </Link>
          <div className="account-dashboard__actions">
            <Link href="/shop">
              <ShoppingBag size={16} aria-hidden="true" />
              Buka toko
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            <form action="/api/account/logout" method="post">
              <button className="account-dashboard__logout" type="submit">
                <LogOut size={15} aria-hidden="true" />
                Keluar
              </button>
            </form>
          </div>
        </header>

        <div className="account-dashboard__hero">
          <p className="account-panel__kicker">DLavie Account</p>
          <h1 id="dashboard-title">Selamat datang, {fullName}</h1>
          <p>{user.email}</p>
        </div>

        <div className="account-dashboard__grid">
          <article>
            <span>Workspace</span>
            <strong>Akses personal</strong>
            <p>Identitas DLavie Anda aktif dan siap dihubungkan ke workspace produk.</p>
          </article>
          <article>
            <span>Minat produk</span>
            <strong>{productInterest}</strong>
            <p>Preferensi ini membantu mengarahkan onboarding ke Commerce, AI, atau Automation.</p>
          </article>
          <article>
            <span>Keamanan</span>
            <strong>Supabase Auth</strong>
            <p>Session dilindungi cookie HTTP-only yang diatur langsung oleh server DLavie.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
