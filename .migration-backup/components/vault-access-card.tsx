type VaultAccessCardProps = {
  status: string;
  downloadUrl: string;
};

export function VaultAccessCard({ status, downloadUrl }: VaultAccessCardProps) {
  return (
    <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,.24)]">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">Vault Access</p>
      <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight">Secure file gate untuk produk digital.</h2>
      <p className="mt-3 text-sm font-semibold leading-6 text-white/55">Masukkan data order yang valid untuk membuka link download sementara. Link dibuat dari API DLAVIE dan berlaku terbatas.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {['Order ID', 'Product ID', 'Buyer Email'].map((item, index) => (
          <div key={item} className="rounded-[1.35rem] bg-white/10 p-4 ring-1 ring-white/10">
            <p className="text-xs font-black text-[#dfff4f]">0{index + 1}</p>
            <p className="mt-2 text-sm font-black">{item}</p>
          </div>
        ))}
      </div>
      {status && <p className="mt-5 rounded-[1.2rem] bg-white/10 p-4 text-sm font-bold leading-6 text-white/70 ring-1 ring-white/10">{status}</p>}
      {downloadUrl && <a href={downloadUrl} className="mt-5 inline-flex rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950">Download Sekarang</a>}
    </section>
  );
}
