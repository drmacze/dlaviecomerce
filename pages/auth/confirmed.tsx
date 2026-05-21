import Link from 'next/link';

export default function AuthConfirmedPage() {
  return (
    <main className="min-h-screen bg-[#f6f2e9] p-6 text-slate-950">
      <section className="mx-auto max-w-md rounded-[2rem] bg-white/70 p-6 text-center shadow-xl">
        <h1 className="text-3xl font-black">Email berhasil dikonfirmasi</h1>
        <p className="mt-3 font-semibold text-slate-500">Akun Dlavie kamu sudah aktif.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950">Masuk</Link>
      </section>
    </main>
  );
}
