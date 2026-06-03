import Link from 'next/link';

export const metadata = {
  title: 'Terms — DLavie',
  description: 'DLavie service terms.',
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <header className="legal-topbar">
        <Link href="/">DLavie</Link>
        <nav aria-label="Legal navigation">
          <Link href="/privacy">Privacy</Link>
          <Link href="/account/login">Login</Link>
        </nav>
      </header>
      <article className="legal-shell">
        <p className="legal-eyebrow">DLavie Legal</p>
        <h1>Ketentuan Layanan</h1>
        <p className="legal-lead">Halaman ini menjelaskan aturan dasar penggunaan DLavie Account dan layanan DLavie.</p>
        <div className="legal-sections">
          <section><h2>1. Akun</h2><p>Gunakan akun DLavie secara aman dan sesuai tujuan layanan.</p></section>
          <section><h2>2. DLavie Card</h2><p>DLavie Card menampilkan status dan masa aktif akun dalam ekosistem DLavie.</p></section>
          <section><h2>3. Layanan</h2><p>Fitur DLavie dapat berubah untuk meningkatkan kualitas, keamanan, dan pengalaman pengguna.</p></section>
        </div>
      </article>
    </main>
  );
}
