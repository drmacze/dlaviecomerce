import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ArrowUpRight, CreditCard, Globe2, LogOut, ReceiptText, ShoppingBag } from 'lucide-react';
import { DlavieBrand } from '../../../src/components/brand/DlavieBrand';
import { COUNTRY_OPTIONS } from '../../../src/i18n/config';
import {
  getSupabaseAuthEndpoint,
  getSupabaseRequestHeaders,
} from '../../../src/lib/supabase/url';
import {
  DLAVIE_ACCESS_COOKIE,
  type DlavieSupabaseUser,
} from '../../../src/lib/supabase/session';

export const metadata = {
  title: 'Account — DLavie Commerce',
  description: 'Manage your DLavie Commerce account and transaction preferences.',
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

const copy = {
  en: {
    shop: 'Open catalog',
    orders: 'Track orders',
    logout: 'Sign out',
    welcome: 'Welcome',
    account: 'DLavie Commerce Account',
    catalog: 'Product catalog',
    catalogValue: 'Digiflazz',
    catalogCopy: 'Digital products are organized and synchronized through the commerce catalog.',
    payment: 'Payment provider',
    paymentValue: 'Midtrans',
    paymentCopy: 'Payment status is verified on the server before an order is processed.',
    region: 'Country and language',
    regionCopy: 'The interface language follows the country selected during onboarding.',
    discovery: 'How you found DLavie',
    discoveryCopy: 'This information helps improve the storefront and product communication.',
    unknown: 'Not specified',
  },
  id: {
    shop: 'Buka katalog',
    orders: 'Lacak pesanan',
    logout: 'Keluar',
    welcome: 'Selamat datang',
    account: 'Akun DLavie Commerce',
    catalog: 'Katalog produk',
    catalogValue: 'Digiflazz',
    catalogCopy: 'Produk digital disusun dan disinkronkan melalui sistem katalog commerce.',
    payment: 'Penyedia pembayaran',
    paymentValue: 'Midtrans',
    paymentCopy: 'Status pembayaran diverifikasi di server sebelum pesanan diproses.',
    region: 'Negara dan bahasa',
    regionCopy: 'Bahasa antarmuka mengikuti negara yang dipilih saat onboarding.',
    discovery: 'Sumber mengenal DLavie',
    discoveryCopy: 'Informasi ini membantu memperbaiki storefront dan komunikasi produk.',
    unknown: 'Belum ditentukan',
  },
} as const;

export default async function AccountDashboardPage() {
  const user = await getDashboardUser();
  if (!user) redirect('/account/login');
  if (typeof user.user_metadata?.onboarding_completed_at !== 'string') {
    redirect('/account/onboarding');
  }

  const fullName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : 'DLavie member';
  const countryCode =
    typeof user.user_metadata?.country_code === 'string' ? user.user_metadata.country_code : 'OTHER';
  const locale = user.user_metadata?.locale === 'id' ? 'id' : 'en';
  const labels = copy[locale];
  const country = COUNTRY_OPTIONS.find((item) => item.code === countryCode)?.[locale] ?? countryCode;
  const discovery =
    typeof user.user_metadata?.discovery_source === 'string'
      ? user.user_metadata.discovery_source.replaceAll('-', ' ')
      : labels.unknown;

  return (
    <main className="account-shell account-dashboard-shell">
      <section className="account-dashboard" aria-labelledby="dashboard-title">
        <header className="account-dashboard__header">
          <Link className="account-brand" href="/shop" aria-label="DLavie Commerce">
            <DlavieBrand product="Commerce" compact />
          </Link>
          <div className="account-dashboard__actions">
            <Link href="/shop">
              <ShoppingBag size={16} aria-hidden="true" />
              {labels.shop}
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            <Link href="/orders">
              <ReceiptText size={16} aria-hidden="true" />
              {labels.orders}
            </Link>
            <form action="/api/account/logout" method="post">
              <button className="account-dashboard__logout" type="submit">
                <LogOut size={15} aria-hidden="true" />
                {labels.logout}
              </button>
            </form>
          </div>
        </header>

        <div className="account-dashboard__hero">
          <p className="account-panel__kicker">{labels.account}</p>
          <h1 id="dashboard-title">{labels.welcome}, {fullName}</h1>
          <p>{user.email}</p>
        </div>

        <div className="account-dashboard__grid">
          <article>
            <span>{labels.catalog}</span>
            <strong className="account-dashboard__inline-value">
              <ShoppingBag size={17} aria-hidden="true" /> {labels.catalogValue}
            </strong>
            <p>{labels.catalogCopy}</p>
          </article>
          <article>
            <span>{labels.payment}</span>
            <strong className="account-dashboard__inline-value">
              <CreditCard size={17} aria-hidden="true" /> {labels.paymentValue}
            </strong>
            <p>{labels.paymentCopy}</p>
          </article>
          <article>
            <span>{labels.region}</span>
            <strong className="account-dashboard__inline-value">
              <Globe2 size={17} aria-hidden="true" /> {country} · {locale === 'id' ? 'Bahasa Indonesia' : 'English'}
            </strong>
            <p>{labels.regionCopy}</p>
          </article>
          <article>
            <span>{labels.discovery}</span>
            <strong>{discovery}</strong>
            <p>{labels.discoveryCopy}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
