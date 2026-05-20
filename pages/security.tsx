import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';

const checks = [
  { name: 'Email verified', ok: true },
  { name: 'Device session guard', ok: true },
  { name: 'Suspicious login alert', ok: true },
  { name: '2FA backup codes', ok: false },
  { name: 'Password strength', ok: true }
];

export default function SecurityPage() {
  return <DlavieEcosystemPage eyebrow="ACCOUNT SECURITY CENTER" title="Akun commerce harus terasa aman sebelum terasa keren." description="DLAVIE Security Center menyiapkan login history, device/session manager, suspicious login detection, dan security score agar wallet dan order user tetap terlindungi." accent="#ff9f43" metrics={[{ label: 'Score', value: '92/100', hint: 'Security score preview' }, { label: 'Devices', value: '2', hint: 'Active sessions' }, { label: 'Alerts', value: '0', hint: 'No suspicious login' }, { label: '2FA', value: 'Soon', hint: 'Backup code ready' }]} actions={[{ label: 'Wallet', href: '/wallet' }, { label: 'Profile', href: '/profile' }, { label: 'Login', href: '/login', primary: true }]}><div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><div className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-xs font-black uppercase tracking-[0.28em] text-[#ff9f43]">Security Score</p><div className="relative mx-auto mt-8 grid h-56 w-56 place-items-center rounded-full bg-white/5 ring-1 ring-white/10"><div className="absolute inset-4 rounded-full border-[12px] border-white/10" /><div className="absolute inset-4 rounded-full border-[12px] border-[#ff9f43]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 92%, 0 92%)' }} /><div className="text-center"><p className="text-6xl font-black">92</p><p className="font-black text-white/45">Protected</p></div></div></div><div className="grid gap-4">{checks.map((check)=><div key={check.name} className="dlavie-soft-card flex items-center justify-between rounded-[1.6rem] p-5"><p className="font-black">{check.name}</p><span className={`rounded-full px-3 py-1 text-xs font-black ${check.ok ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{check.ok ? 'Active' : 'Setup'}</span></div>)}</div></div></DlavieEcosystemPage>;
}
