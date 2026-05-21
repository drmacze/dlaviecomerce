import Link from 'next/link';

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[#f6f2e9] px-5 py-8 text-slate-950">
      <section className="dlavie-glass mx-auto max-w-3xl rounded-[2.5rem] p-6 md:p-8">
        <p className="font-black uppercase tracking-[0.3em] text-slate-400">Dlavie Account</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Security Center</h1>
        <p className="mt-3 font-semibold text-slate-500">
          Halaman keamanan akun Dlavie sudah disiapkan. Integrasi session dan daftar perangkat akan ditambahkan di commit berikutnya.
        </p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-[#dfff4f] px-6 py-4 font-black text-slate-950">
          Kembali ke Login
        </Link>
      </section>
    </main>
  );
}
