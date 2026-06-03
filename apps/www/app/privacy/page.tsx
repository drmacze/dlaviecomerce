import Link from 'next/link';

export const metadata = {
  title: 'Privacy — DLavie',
  description: 'DLavie privacy information.',
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <header className="legal-topbar">
        <Link href="/">DLavie</Link>
        <nav aria-label="Legal navigation">
          <Link href="/terms">Terms</Link>
          <Link href="/account/login">Login</Link>
        </nav>
      </header>
      <article className="legal-shell">
        <p className="legal-eyebrow">DLavie Privacy</p>
        <h1>Kebijakan Privasi</h1>
        <p className="legal-lead">Ringkasan cara DLavie menangani data akun dan pengalaman pengguna.</p>
        <div className="legal-sections">
          <section><h2>1. Data akun</h2><p>DLavie memakai data akun dasar untuk menjalankan akses dan identitas pengguna.</p></section>
          <section><h2>2. Keamanan</h2><p>DLavie menjaga akses akun melalui sistem autentikasi dan validasi sesi.</p></section>
          <section><h2>3. Retensi</h2><p>Status akun dapat dibatasi atau diarsipkan sesuai masa aktif DLavie Card.</p></section>
        </div>
      </article>
    </main>
  );
}
