import Link from 'next/link';
import { SvgIcon } from '../../src/components/ui/SvgIcon';

export const metadata = {
  title: 'FAQ — DLavie Account',
  description: 'DLavie Account rules, DLavie Card validity, renewal, security, and product access information.',
};

const sections = [
  {
    title: 'DLavie Account',
    items: [
      ['Apa itu DLavie Account?', 'DLavie Account adalah identitas utama untuk mengakses DLavieOS, DLavie AI, Commerce, dan layanan automation DLavie.'],
      ['Kenapa saya perlu membuat akun?', 'Agar akses ke berbagai produk DLavie tetap konsisten, aman, dan dapat digunakan lintas layanan.'],
      ['Apakah satu akun berlaku untuk semua layanan DLavie?', 'Ya, akun yang sama disiapkan untuk DLavieOS, DLavie AI, Commerce, dan layanan ekosistem lainnya.'],
    ],
  },
  {
    title: 'DLavie Card',
    items: [
      ['Apa itu DLavie Card?', 'DLavie Card adalah kartu identitas akun yang menunjukkan status, tier, masa aktif, dan akses pengguna dalam ekosistem DLavie.'],
      ['Berapa lama masa aktif card?', 'Starter Card aktif selama 30 hari sejak akun dibuat.'],
      ['Apa yang terjadi jika card kadaluarsa?', 'Akses dapat dibatasi sampai card diperpanjang. Akun tidak langsung di-blacklist hanya karena kadaluarsa.'],
    ],
  },
  {
    title: 'Renewal',
    items: [
      ['Berapa biaya perpanjangan?', 'Rp5.000 untuk 30 hari. Rp25.000 untuk 1 tahun. Rp50.000 untuk permanent identity, jika opsi ini tersedia.'],
      ['Kenapa DLavie memakai masa aktif card?', 'Untuk menjaga database tetap sehat, mengurangi akun tidak aktif, dan memastikan identitas yang tersimpan tetap relevan.'],
    ],
  },
  {
    title: 'Security',
    items: [
      ['Apakah akun saya aman?', 'DLavie Account menggunakan Supabase Auth dan session cookie server-side. Pengamanan tambahan akan terus ditingkatkan.'],
      ['Apakah expired account akan dihapus?', 'Account lifecycle akan menggunakan status seperti active, expired, grace period, suspended, dan archived. Penghapusan permanen hanya dilakukan sesuai kebijakan retensi.'],
    ],
  },
  {
    title: 'Product Access',
    items: [
      ['Apakah DLavie Card dipakai untuk DLavie AI?', 'Ya, DLavie Card disiapkan sebagai identitas akses untuk DLavie AI.'],
      ['Apakah berlaku untuk Commerce?', 'Ya, akun yang sama dirancang untuk Commerce/PPOB dan layanan E-Commerce DLavie.'],
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="account-shell account-info-shell">
      <section className="account-info-page account-faq-page" aria-labelledby="faq-title">
        <header className="account-info-page__header">
          <Link className="account-brand" href="/" aria-label="Back to DLavie home">
            <SvgIcon name="brand" />
            <span>DLAVIE</span>
          </Link>
          <nav className="account-info-page__nav" aria-label="FAQ navigation">
            <Link href="/account/dashboard">Dashboard</Link>
            <Link href="/account/card">Account Card</Link>
            <Link href="/">Website</Link>
          </nav>
        </header>

        <div className="account-info-page__hero">
          <p className="account-panel__kicker">DLavie Account FAQ</p>
          <h1 id="faq-title">Account rules and access information</h1>
          <p>Pelajari fungsi DLavie Account, masa aktif DLavie Card, renewal, keamanan, dan akses produk ekosistem DLavie.</p>
        </div>

        <div className="account-faq-sections">
          {sections.map((section) => (
            <section className="account-faq-section" key={section.title} aria-labelledby={`faq-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <h2 id={`faq-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>{section.title}</h2>
              <div className="account-faq-list">
                {section.items.map(([question, answer]) => (
                  <article className="account-faq-card" key={question}>
                    <h3>{question}</h3>
                    <p>{answer}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
