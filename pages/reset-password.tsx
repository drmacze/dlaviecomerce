import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#f6f2e9] p-6 text-slate-950">
      <section className="dlavie-glass mx-auto max-w-md rounded-[2.5rem] p-6 md:p-8">
        <p className="text-center font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE RECOVERY</p>
        <h1 className="mt-3 text-center text-4xl font-black tracking-tight">Reset Password</h1>
        <p className="mt-3 text-center font-semibold text-slate-500">Halaman pemulihan akses Dlavie sudah disiapkan.</p>
        <Link href="/login" className="mt-6 inline-flex w-full justify-center rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950">Kembali ke login</Link>
      </section>
    </main>
  );
}
