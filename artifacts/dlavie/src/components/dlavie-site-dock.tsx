import {
  Bot,
  Home,
  LayoutDashboard,
  Package,
  ReceiptText,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Link } from "wouter";
import { useRouter } from "@/lib/router";

const dockItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Produk", icon: Package },
  { href: "/wallet", label: "Wallet", icon: WalletCards },
  { href: "/orders", label: "Orders", icon: ReceiptText },
  { href: "/dashboard", label: "Dash", icon: LayoutDashboard },
  { href: "/ai", label: "AI", icon: Bot },
] as const;

function isRouteActive(currentPath: string, href: string) {
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function DlavieSiteDock() {
  const router = useRouter();

  if (router.pathname === "/ai" || router.pathname.startsWith("/ai/"))
    return null;

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-[1.75rem] border border-[#e5e4e2]/12 bg-[#090805]/82 px-2 py-2 shadow-[0_26px_90px_rgba(0,0,0,.55)] ring-1 ring-white/[0.04] backdrop-blur-2xl md:bottom-5 md:px-3"
      aria-label="DLAVIE global navigation"
    >
      <div className="grid grid-cols-6 gap-1.5">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(router.pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative grid min-w-0 place-items-center gap-1 rounded-[1.25rem] px-2 py-2.5 text-[10px] font-black transition duration-300 md:text-xs ${
                active
                  ? "bg-[#c7a329] text-[#080805] shadow-[0_16px_38px_rgba(199,163,41,.25)]"
                  : "text-[#c3b49d]/62 hover:-translate-y-1 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {active ? (
                <span className="absolute -top-1 h-1.5 w-8 rounded-full bg-[#fff0b7] shadow-[0_0_20px_rgba(199,163,41,.65)]" />
              ) : null}
              <Icon className="h-4 w-4 md:h-5 md:w-5" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-[#e5e4e2]/12 bg-[#090805]/82 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#c3b49d]/62 shadow-sm backdrop-blur-xl md:flex">
        <Sparkles className="h-3.5 w-3.5 text-[#c7a329]" />
        Hypermotion 3.0
      </div>
    </nav>
  );
}
