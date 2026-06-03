import Link from 'next/link';

export const metadata = {
  title: 'Privacy — DLavie',
  description: 'DLavie privacy information.',
};

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100svh', color: 'white', background: 'linear-gradient(180deg,#050505,#0a0a0b)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
        <Link style={{ color: 'white', textDecoration: 'none', fontWeight: 800 }} href="/">DLavie</Link>
        <nav aria-label="Legal navigation" style={{ display: 'inline-flex', gap: '1rem' }}>
          <Link style={{ color: 'rgba(255,255,255,.75)' }} href="/terms">Terms</Link>
          <Link style={{ color: 'rgba(255,255,255,.75)' }} href="/account/login">Login</Link>
        </nav>
      </header>
      <article style={{ width: 'min(100%,54rem)', margin: '0 auto', padding: 'clamp(3rem,10vw,7rem) clamp(1.25rem,5vw,2rem)' }}>
        <p style={{ color: 'rgba(255,255,255,.48)', fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase' }}>DLavie Privacy</p>
        <h1 style={{ margin: 0, fontSize: 'clamp(3.8rem,13vw,8rem)', lineHeight: .82, letterSpacing: '-.08em' }}>Kebijakan Privasi</h1>
        <p style={{ margin: '1.4rem 0 3rem', color: 'rgba(255,255,255,.68)', fontSize: 'clamp(1.1rem,3vw,1.45rem)', lineHeight: 1.65 }}>Ringkasan kebijakan privasi DLavie untuk akun dan layanan.</p>
        <div style={{ display: 'grid', gap: 1, border: '1px solid rgba(255,255,255,.11)', background: 'rgba(255,255,255,.1)' }}>
          <section style={{ padding: 'clamp(1.25rem,4vw,2rem)', background: 'rgba(5,5,5,.82)' }}><h2>1. Akun</h2><p>Informasi akun dipakai untuk menjalankan akses dan identitas pengguna.</p></section>
          <section style={{ padding: 'clamp(1.25rem,4vw,2rem)', background: 'rgba(5,5,5,.82)' }}><h2>2. Sesi</h2><p>Sesi akun digunakan agar pengalaman masuk tetap aman dan konsisten.</p></section>
          <section style={{ padding: 'clamp(1.25rem,4vw,2rem)', background: 'rgba(5,5,5,.82)' }}><h2>3. Retensi</h2><p>Status akun mengikuti masa aktif DLavie Card.</p></section>
        </div>
      </article>
    </main>
  );
}
