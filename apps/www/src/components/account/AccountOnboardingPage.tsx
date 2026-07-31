'use client';

import { FormEvent, useMemo, useState, useTransition } from 'react';
import { ArrowRight, Check, Globe2 } from 'lucide-react';
import { COUNTRY_OPTIONS, localeFromCountry } from '../../i18n/config';
import { useDlavieLocale } from '../i18n/LocaleExperience';
import { DlavieBrand } from '../brand/DlavieBrand';

type Option = { value: string; en: string; id: string };

const DISCOVERY_OPTIONS: Option[] = [
  { value: 'search', en: 'Search engine or Google', id: 'Mesin pencari atau Google' },
  { value: 'social', en: 'Social media', id: 'Media sosial' },
  {
    value: 'recommendation',
    en: 'Friend or professional recommendation',
    id: 'Rekomendasi teman atau profesional',
  },
  {
    value: 'community',
    en: 'Community, event, or webinar',
    id: 'Komunitas, acara, atau webinar',
  },
  {
    value: 'media',
    en: 'Article, publication, or media',
    id: 'Artikel, publikasi, atau media',
  },
  { value: 'other', en: 'Other', id: 'Lainnya' },
];

const ROLE_OPTIONS: Option[] = [
  { value: 'personal', en: 'Personal customer', id: 'Pelanggan pribadi' },
  {
    value: 'business-owner',
    en: 'Business owner or reseller',
    id: 'Pemilik bisnis atau reseller',
  },
  {
    value: 'operator',
    en: 'Operations or administration',
    id: 'Operasional atau administrasi',
  },
  {
    value: 'partner',
    en: 'Potential commerce partner',
    id: 'Calon partner commerce',
  },
  { value: 'exploring', en: 'Still exploring', id: 'Masih menjelajah' },
];

const GOAL_OPTIONS: Option[] = [
  { value: 'mobile-credit', en: 'Buy mobile credit or data', id: 'Membeli pulsa atau paket data' },
  { value: 'voucher', en: 'Buy game and digital vouchers', id: 'Membeli voucher game dan digital' },
  { value: 'bills', en: 'Pay bills and postpaid products', id: 'Membayar tagihan dan produk pascabayar' },
  { value: 'repeat-orders', en: 'Track and repeat previous orders', id: 'Melacak dan mengulang pesanan' },
  { value: 'reseller', en: 'Explore reseller opportunities', id: 'Menjelajahi peluang reseller' },
];

const copy = {
  en: {
    kicker: 'Set up your commerce experience',
    title: 'A few details before your first transaction.',
    description:
      'Your answers set the interface language and help DLavie show the most relevant digital product categories.',
    country: 'Country or region',
    discovery: 'How did you first hear about DLavie Commerce?',
    role: 'Which description fits you best?',
    goals: 'Which products are you interested in?',
    language: 'Interface language',
    languageValue: 'English',
    submit: 'Continue to the catalog',
    saving: 'Saving preferences',
    privacy: 'These preferences are stored securely in your DLavie Account profile.',
    required: 'Please complete all required fields and select at least one product interest.',
    error: 'Your preferences could not be saved. Please try again.',
  },
  id: {
    kicker: 'Atur pengalaman commerce Anda',
    title: 'Beberapa informasi sebelum transaksi pertama.',
    description:
      'Jawaban Anda menentukan bahasa antarmuka dan membantu DLavie menampilkan kategori produk digital yang paling relevan.',
    country: 'Negara atau wilayah',
    discovery: 'Dari mana Anda pertama kali mengetahui DLavie Commerce?',
    role: 'Deskripsi mana yang paling sesuai dengan Anda?',
    goals: 'Produk apa yang paling Anda butuhkan?',
    language: 'Bahasa antarmuka',
    languageValue: 'Bahasa Indonesia',
    submit: 'Lanjut ke katalog',
    saving: 'Menyimpan preferensi',
    privacy: 'Preferensi ini disimpan secara aman di profil DLavie Account Anda.',
    required: 'Lengkapi seluruh kolom wajib dan pilih setidaknya satu minat produk.',
    error: 'Preferensi belum dapat disimpan. Silakan coba kembali.',
  },
} as const;

export function AccountOnboardingPage({ defaultCountry }: { defaultCountry?: string }) {
  const { locale, setLocale } = useDlavieLocale();
  const labels = copy[locale];
  const initialCountry = defaultCountry?.toUpperCase() || (locale === 'id' ? 'ID' : '');
  const [country, setCountry] = useState(initialCountry);
  const [discovery, setDiscovery] = useState('');
  const [role, setRole] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const countryLabel = useMemo(
    () => COUNTRY_OPTIONS.find((item) => item.code === country)?.[locale] ?? '',
    [country, locale],
  );

  const selectCountry = (value: string) => {
    setCountry(value);
    setLocale(localeFromCountry(value));
  };

  const toggleGoal = (value: string) => {
    setGoals((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (!country || !discovery || !role || goals.length === 0) {
      setStatus(labels.required);
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/account/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country, discovery, role, goals }),
        });
        const result = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          redirectTo?: string;
          message?: string;
        };

        if (!response.ok || !result.ok) {
          setStatus(result.message ?? labels.error);
          return;
        }

        window.location.assign(result.redirectTo ?? '/shop');
      } catch {
        setStatus(labels.error);
      }
    });
  };

  return (
    <main className="onboarding-shell">
      <section className="onboarding-card" aria-labelledby="onboarding-title">
        <header className="onboarding-header">
          <a href="/shop" aria-label="DLavie Commerce">
            <DlavieBrand product="Commerce" compact />
          </a>
          <div className="onboarding-step" aria-label="Onboarding step 1 of 1">
            <span>01</span>
            <i />
            <small>01</small>
          </div>
        </header>

        <div className="onboarding-intro">
          <p>{labels.kicker}</p>
          <h1 id="onboarding-title">{labels.title}</h1>
          <span>{labels.description}</span>
        </div>

        <form className="onboarding-form" onSubmit={submit}>
          <label className="onboarding-field">
            <span>{labels.country}</span>
            <select value={country} onChange={(event) => selectCountry(event.target.value)} required>
              <option value="">—</option>
              {COUNTRY_OPTIONS.map((item) => (
                <option key={item.code} value={item.code}>
                  {item[locale]}
                </option>
              ))}
            </select>
          </label>

          <label className="onboarding-field">
            <span>{labels.discovery}</span>
            <select value={discovery} onChange={(event) => setDiscovery(event.target.value)} required>
              <option value="">—</option>
              {DISCOVERY_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item[locale]}
                </option>
              ))}
            </select>
          </label>

          <label className="onboarding-field">
            <span>{labels.role}</span>
            <select value={role} onChange={(event) => setRole(event.target.value)} required>
              <option value="">—</option>
              {ROLE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item[locale]}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="onboarding-goals">
            <legend>{labels.goals}</legend>
            <div>
              {GOAL_OPTIONS.map((item) => {
                const active = goals.includes(item.value);
                return (
                  <button
                    key={item.value}
                    type="button"
                    data-active={active}
                    onClick={() => toggleGoal(item.value)}
                    aria-pressed={active}
                  >
                    <span>{active ? <Check size={14} aria-hidden="true" /> : null}</span>
                    {item[locale]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="onboarding-language" aria-live="polite">
            <Globe2 size={18} aria-hidden="true" />
            <span>
              <small>{labels.language}</small>
              <strong>{labels.languageValue}</strong>
            </span>
            {countryLabel ? <em>{countryLabel}</em> : null}
          </div>

          {status ? <p className="onboarding-status">{status}</p> : null}

          <footer className="onboarding-footer">
            <p>{labels.privacy}</p>
            <button type="submit" disabled={isPending}>
              {isPending ? labels.saving : labels.submit}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </footer>
        </form>
      </section>
    </main>
  );
}
