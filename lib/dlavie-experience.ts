export const dlavieRoutes = [
  { href: '/', label: 'Home', description: 'Opening experience dan brand stage DLAVIE.' },
  { href: '/products', label: 'Produk', description: 'Pulsa, data, PLN, game, voucher, dan wallet.' },
  { href: '/wallet', label: 'Wallet', description: 'D-Balance, top up, dan transaksi cepat.' },
  { href: '/orders', label: 'Orders', description: 'Riwayat transaksi dan status order.' },
  { href: '/rewards', label: 'Rewards', description: 'D-Points, VIP, dan benefit pengguna.' },
  { href: '/dashboard', label: 'Dashboard', description: 'Pusat kontrol akun DLAVIE.' },
  { href: '/ai', label: 'AI', description: 'Asisten AI untuk rekomendasi dan bantuan.' }
] as const;

export const dlavieExperience = {
  brand: 'DLAVIE',
  release: 'Experience Engine 2.0',
  tagline: 'Digital commerce yang terasa hidup, cepat, dan premium.',
  motion: {
    easing: [0.16, 1, 0.3, 1] as const,
    fast: 0.22,
    normal: 0.52,
    cinematic: 0.9
  },
  nav: dlavieRoutes
} as const;

export type DlavieRoute = (typeof dlavieRoutes)[number];
