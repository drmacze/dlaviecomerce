import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ArrowUpRight, Globe2, LogOut, ShoppingBag } from 'lucide-react';
import { DlavieBrand } from '../../../src/components/brand/DlavieBrand';
import { COUNTRY_OPTIONS } from '../../../src/i18n/config';
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

  if (typeof user.user_metadata?.onboarding_completed_at !== 'string') {
    redirect('/account/onboarding');
  }

  const fullName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : 'DLavie member';
  const productInterest =
    typeof user.user_metadata?.product_interest === 'string'
      ? user.user_metadata.product_interest
      : 'full ecosystem';
  const countryCode =
    typeof user.user_metadata?.country_code === 'string' ? user.user_metadata.country_code : 'OTHER';
  const locale = user.user_metadata?.locale === 'id' ? 'id' : 'en';
  const country = COUNTRY_OPTIONS.find((item) => item.code === countryCode)?.[locale] ?? countryCode;
  const discovery =
    typeof user.user_metadata?.discovery_source === 'string'
      ? user.user_metadata.discovery_source.replaceAll('-', ' ')
      : 'not specified';

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
            <p>Preferensi ini membantu mengarahkan pengalaman ke Commerce, AI, atau Automation.</p>
          </article>
          <article>
            <span>Negara dan bahasa</span>
            <strong className="account-dashboard__inline-value">
              <Globe2 size={17} aria-hidden="true" /> {country} · {locale === 'id' ? 'Bahasa Indonesia' : 'English'}
            </strong>
            <p>Bahasa antarmuka mengikuti negara yang dipilih saat onboarding.</p>
          </article>
          <article>
            <span>Sumber penemuan</span>
            <strong>{discovery}</strong>
            <p>Informasi ini membantu DLavie memperbaiki pengalaman dan komunikasi produk.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
