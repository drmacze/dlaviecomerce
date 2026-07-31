'use client';

import {
  Boxes,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Settings,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { AdminClientError, getSession, signOut } from '../../admin/client';
import type { AdminSessionView } from '../../admin/types';

const links = [
  { href: '/admin', label: 'Ringkasan', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produk', icon: PackageSearch },
  { href: '/admin/orders', label: 'Pesanan', icon: ShoppingBag },
  { href: '/admin/settings', label: 'Katalog & pengiriman', icon: Settings },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AdminSessionView | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void getSession()
      .then((value) => {
        if (active) setSession(value);
      })
      .catch((error) => {
        if (!active) return;
        const next = encodeURIComponent(pathname || '/admin');
        if (error instanceof AdminClientError && [401, 403].includes(error.status)) {
          router.replace(`/admin/login?next=${next}`);
          return;
        }
        router.replace(`/admin/login?next=${next}&error=unavailable`);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  async function logout(): Promise<void> {
    await signOut().catch(() => undefined);
    router.replace('/admin/login');
    router.refresh();
  }

  if (!ready || !session) {
    return (
      <main className="admin-auth-state" aria-live="polite">
        <span className="admin-loader" />
        <p>Memverifikasi sesi operator…</p>
      </main>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin">
          <span className="admin-brand__mark">D</span>
          <span>
            <strong>DLavie</strong>
            <small>Commerce Admin</small>
          </span>
        </Link>

        <nav aria-label="Navigasi admin">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined}>
                <Icon size={18} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <div>
            <Boxes size={16} aria-hidden="true" />
            <span title={session.email}>{session.email}</span>
          </div>
          <button type="button" onClick={logout}>
            <LogOut size={16} aria-hidden="true" /> Keluar
          </button>
        </div>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
