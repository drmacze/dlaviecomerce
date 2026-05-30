import { useRouter } from 'next/router';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';

export default function OrderSuccessPage() {
  const router = useRouter();
  const orderId = String(router.query.orderId || '');
  const status = String(router.query.status || 'pending');
  const total = Number(router.query.total || 0);
  const paid = status === 'paid';

  return (
    <DlavieEcosystemPage
      eyebrow="DLAVIE ORDER"
      title={paid ? 'Order paid. Digital access is preparing.' : 'Order created. Menunggu konfirmasi.'}
      description="Order kamu sudah masuk ke sistem DLAVIE. Simpan Order ID ini untuk tracking, download vault, dan bantuan admin."
      accent="#dfff4f"
      metrics={[
        { label: 'Status', value: status.toUpperCase(), hint: paid ? 'D-Balance paid' : 'Manual review' },
        { label: 'Total', value: `Rp ${total.toLocaleString('id-ID')}`, hint: 'Final amount' },
        { label: 'Vault', value: paid ? 'SOON' : 'LOCKED', hint: 'After fulfillment' },
        { label: 'Order', value: orderId ? 'SAVED' : 'NEW', hint: 'Tracking ready' }
      ]}
      actions={[
        { label: 'Orders', href: '/orders' },
        { label: 'Downloads', href: '/downloads' },
        { label: 'Shop Again', href: '/#products', primary: true }
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,.24)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">Order Receipt</p>
          <h2 className="mt-4 break-all text-3xl font-black tracking-tight">{orderId || 'Order ID unavailable'}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/55">
            {paid ? 'Pembayaran D-Balance berhasil. Admin bisa fulfill order agar produk muncul di Downloads Library.' : 'Order manual berhasil dibuat. Admin akan mengecek pembayaran lalu mengubah status order.'}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href="/orders" className="rounded-[1.4rem] bg-[#dfff4f] p-5 font-black text-slate-950 transition hover:-translate-y-1">View Orders</a>
            <a href="/download" className="rounded-[1.4rem] bg-white/10 p-5 font-black text-white ring-1 ring-white/10 transition hover:-translate-y-1">Open Vault</a>
            <a href="/wallet" className="rounded-[1.4rem] bg-white/10 p-5 font-black text-white ring-1 ring-white/10 transition hover:-translate-y-1">Wallet</a>
            <a href="/security" className="rounded-[1.4rem] bg-white/10 p-5 font-black text-white ring-1 ring-white/10 transition hover:-translate-y-1">Security</a>
          </div>
        </section>
        <section className="dlavie-soft-card rounded-[2rem] p-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Next Steps</p>
          <div className="mt-5 grid gap-3">
            {[
              paid ? 'Admin fulfill order untuk membuka file digital.' : 'Selesaikan pembayaran manual sesuai instruksi admin.',
              'Cek halaman Orders untuk melihat status terbaru.',
              'Setelah fulfilled, produk muncul di Downloads Library.'
            ].map((item, index) => (
              <div key={item} className="flex gap-3 rounded-[1.25rem] bg-white/75 p-4 ring-1 ring-black/5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#dfff4f] text-sm font-black text-slate-950">{index + 1}</span>
                <p className="self-center font-bold leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DlavieEcosystemPage>
  );
}
