export function OrdersEmptyState() {
  return (
    <div className="dlavie-soft-card rounded-[2rem] p-8">
      <p className="text-3xl font-black tracking-tight text-slate-950">Belum ada order.</p>
      <p className="mt-2 font-semibold leading-7 text-slate-500">Saat order pertama dibuat, riwayat pembelian dan tombol download akan muncul di sini.</p>
      <a href="/#products" className="mt-5 inline-flex rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950">Mulai Belanja</a>
    </div>
  );
}
