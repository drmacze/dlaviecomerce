import Link from 'next/link';

export const metadata = {
  title: 'Terms — DLavie',
  description: 'DLavie service terms.',
};

const pageStyle = {
  minHeight: '100svh',
  color: 'rgba(255,255,255,.9)',
  background: 'radial-gradient(circle at 78% 18%, rgba(120,186,255,.14), transparent 18rem), linear-gradient(180deg,#050505,#0a0a0b)',
} as const;

const topbarStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  borderBottom: '1px solid rgba(255,255,255,.1)',
  padding: '1.25rem',
  background: 'rgba(5,5,5,.76)',
  backdropFilter: 'blur(20px)',
} as const;

const shellStyle = {
  width: 'min(100%,54rem)',
  margin: '0 auto',
  padding: 'clamp(3rem,10vw,7rem) clamp(1.25rem,5vw,2rem)',
} as const;

export default function TermsPage() {
  return (
    <main style={pageStyle}>
      <header style={topbarStyle}>
        <Link style={{ color: 'rgba(255,255,255,.9)', textDecoration: 'none', fontWeight: 800 }} href="/">DLavie</Link>
        <nav aria-label="Legal navigation" style={{ display: 'inline-flex', gap: '1rem' }}>
          <Link style={{ color: 'rgba(255,255,255,.75)' }} href="/privacy">Privacy</Link>
          <Link style={{ color: 'rgba(255,255,255,.75)' }} href="/account/login">Login</Link>
        </nav>
      </header>
      <article style={shellStyle}>
        <p style={{ color: 'rgba(255,255,255,.48)', fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase' }}>DLavie Legal</p>
        <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(3.8rem,13vw,8rem)', lineHeight: .82, letterSpacing: '-.08em' }}>Ketentuan Layanan</h1>
        <p style={{ margin: '1.4rem 0 3rem', color: 'rgba(255,255,255,.68)', fontSize: 'clamp(1.1rem,3vw,1.45rem)', lineHeight: 1.65 }}>Halaman ini menjelaskan aturan dasar penggunaan DLavie Account dan layanan DLavie.</p>
        <div style={{ display: 'grid', gap: 1, border: '1px solid rgba(255,255,255,.11)', background: 'rgba(255,255,255,.1)' }}>
          <section style={{ padding: 'clamp(1.25rem,4vw,2rem)', background: 'rgba(5,5,5,.82)' }}><h2>1. Akun</h2><p>Gunakan akun DLavie secara aman dan sesuai tujuan layanan.</p></section>
          <section style={{ padding: 'clamp(1.25rem,4vw,2rem)', background: 'rgba(5,5,5,.82)' }}><h2>2. DLavie Card</h2><p>DLavie Card menampilkan status dan masa aktif akun dalam ekosistem DLavie.</p></section>
          <section style={{ padding: 'clamp(1.25rem,4vw,2rem)', background: 'rgba(5,5,5,.82)' }}><h2>3. Layanan</h2><p>Fitur DLavie dapat berubah untuk meningkatkan kualitas, keamanan, dan pengalaman pengguna.</p></section>
        </div>
      </article>
    </main>
  );
}
