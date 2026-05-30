import { Bot, Home, LayoutDashboard, Package, ReceiptText, Sparkles, WalletCards } from 'lucide-react';
import { Link } from 'wouter';
import { useRouter } from '@/lib/router';

const dockItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'Produk', icon: Package },
  { href: '/wallet', label: 'Wallet', icon: WalletCards },
  { href: '/orders', label: 'Orders', icon: ReceiptText },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ai', label: 'AI', icon: Bot }
] as const;

function isRouteActive(currentPath: string, href: string) {
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function DlavieSiteDock() {
  const router = useRouter();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-[1.65rem] border border-white/65 bg-white/68 px-2 py-2 shadow-[0_24px_85px_rgba(15,23,42,.18)] ring-1 ring-black/5 backdrop-blur-2xl md:bottom-5 md:px-3" aria-label="DLAVIE global navigation">
      <div className="grid grid-cols-6 gap-1.5">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(router.pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative grid min-w-0 place-items-center gap-1 rounded-[1.25rem] px-2 py-2.5 text-[10px] font-black transition duration-300 md:text-xs ${
                active ? 'bg-slate-950 text-[#dfff4f] shadow-[0_14px_36px_rgba(15,23,42,.22)]' : 'text-slate-500 hover:-translate-y-1 hover:bg-white hover:text-slate-950'
              }`}
            >
              {active ? <span className="absolute -top-1 h-1.5 w-8 rounded-full bg-[#dfff4f] shadow-[0_0_20px_rgba(223,255,79,.7)]" /> : null}
              <Icon className="h-4 w-4 md:h-5 md:w-5" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/55 bg-white/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm backdrop-blur-xl md:flex">
        <Sparkles className="h-3.5 w-3.5 text-slate-950" />
        DLAVIE Experience 2.0
      </div>
    </nav>
  );
}
