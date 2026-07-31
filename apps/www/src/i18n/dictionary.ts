import type { DlavieLocale } from './config';

type PhrasePair = { en: string; id: string };

const PHRASES: PhrasePair[] = [
  { en: 'Home', id: 'Beranda' },
  { en: 'Ecosystem', id: 'Ekosistem' },
  { en: 'AI Workspace', id: 'Ruang Kerja AI' },
  { en: 'Docs', id: 'Dokumentasi' },
  { en: 'Open Workspace', id: 'Buka Workspace' },
  { en: 'Get Started', id: 'Mulai Sekarang' },
  { en: 'Page sections', id: 'Bagian halaman' },
  { en: 'Primary navigation', id: 'Navigasi utama' },
  { en: 'Collapse', id: 'Tutup' },
  { en: 'Expand', id: 'Buka' },
  { en: 'Expand sidebar', id: 'Buka sidebar' },
  { en: 'Preparing your experience', id: 'Menyiapkan pengalaman Anda' },
  { en: 'Intelligent operating system', id: 'Sistem operasi cerdas' },
  {
    en: 'The cinematic command mesh for agents, models, memory, and intelligent operations.',
    id: 'Pusat kendali terpadu untuk agen, model, memori, dan operasi cerdas.',
  },
  {
    en: 'One parent brand. One unified ecosystem. Decisions, transactions, and workflows — perfectly aligned.',
    id: 'Satu brand utama. Satu ekosistem terpadu. Keputusan, transaksi, dan alur kerja yang selaras.',
  },
  { en: 'Explore DLavie OS', id: 'Jelajahi DLavie OS' },
  { en: 'Open AI Workspace', id: 'Buka Ruang Kerja AI' },
  {
    en: 'Built for founders • operators • intelligent systems',
    id: 'Dibangun untuk founder • operator • sistem cerdas',
  },
  { en: 'The philosophy', id: 'Filosofi' },
  {
    en: 'One parent brand. Connected intelligence.',
    id: 'Satu brand utama. Kecerdasan yang terhubung.',
  },
  {
    en: 'DLavie designs connected digital systems under one cohesive brand — from agent workspaces to transaction rails.',
    id: 'DLavie merancang sistem digital terhubung dalam satu brand yang konsisten—dari ruang kerja agen hingga infrastruktur transaksi.',
  },
  { en: 'The core', id: 'Inti sistem' },
  {
    en: 'Turns agents, models, memory, dashboards, and workflows into a single cinematic command mesh.',
    id: 'Menyatukan agen, model, memori, dashboard, dan alur kerja ke dalam satu pusat kendali.',
  },
  { en: 'AI Core', id: 'Inti AI' },
  {
    en: 'Intelligent foundation powering reasoning, orchestration, and decision-making across the ecosystem.',
    id: 'Fondasi cerdas untuk penalaran, orkestrasi, dan pengambilan keputusan di seluruh ekosistem.',
  },
  { en: 'Agents', id: 'Agen' },
  {
    en: 'Autonomous agents that execute complex workflows, handle commerce, and respond to real-time signals.',
    id: 'Agen otonom yang menjalankan alur kerja kompleks, menangani commerce, dan merespons sinyal secara real-time.',
  },
  { en: 'Models', id: 'Model' },
  {
    en: 'Flexible model routing with frontier models, fine-tuned agents, and local inference support.',
    id: 'Routing model fleksibel dengan frontier model, agen yang disesuaikan, dan dukungan inferensi lokal.',
  },
  { en: 'Memory', id: 'Memori' },
  {
    en: 'Persistent contextual memory that remembers conversations, transactions, and operational history.',
    id: 'Memori kontekstual persisten yang mengingat percakapan, transaksi, dan riwayat operasional.',
  },
  { en: 'Dashboards', id: 'Dashboard' },
  {
    en: 'Real-time command surfaces for monitoring agents, commerce metrics, and system health.',
    id: 'Pusat kendali real-time untuk memantau agen, metrik commerce, dan kesehatan sistem.',
  },
  { en: 'Workflows', id: 'Alur kerja' },
  {
    en: 'Visual and code-based orchestration of multi-step processes across AI, commerce, and automation.',
    id: 'Orkestrasi visual dan berbasis kode untuk proses bertahap di AI, commerce, dan automation.',
  },
  { en: 'Learn more', id: 'Pelajari lebih lanjut' },
  { en: 'Unified by design', id: 'Terpadu sejak awal' },
  { en: 'One ecosystem. Zero friction.', id: 'Satu ekosistem. Tanpa hambatan.' },
  {
    en: 'PPOB products, storefront flows, transaction rails, and automated settlement — all connected.',
    id: 'Produk PPOB, alur storefront, infrastruktur transaksi, dan settlement otomatis—semuanya terhubung.',
  },
  { en: 'Automation Layer', id: 'Lapisan Automation' },
  {
    en: 'Triggers, agents, and commerce events stay synchronized from signal to final settlement.',
    id: 'Trigger, agen, dan event commerce tetap tersinkron dari sinyal hingga settlement akhir.',
  },
  {
    en: 'The intelligent command layer that orchestrates everything into one unified experience.',
    id: 'Lapisan kendali cerdas yang mengorkestrasi semuanya menjadi satu pengalaman terpadu.',
  },
  { en: 'The workspace', id: 'Ruang kerja' },
  { en: 'Experience the command layer.', id: 'Rasakan pusat kendali terpadu.' },
  {
    en: 'DLavie AI Workspace is where intelligence meets operations. Account-aware, context-rich, and built for real work.',
    id: 'DLavie AI Workspace menyatukan kecerdasan dan operasional. Terhubung dengan akun, kaya konteks, dan dibangun untuk pekerjaan nyata.',
  },
  { en: 'Open DLavie AI Workspace', id: 'Buka DLavie AI Workspace' },
  { en: 'Learn about DLavie OS', id: 'Pelajari DLavie OS' },
  {
    en: 'Ready to build with intelligence?',
    id: 'Siap membangun dengan kecerdasan?',
  },
  {
    en: 'Start with DLavie OS or dive straight into the AI workspace.',
    id: 'Mulai dengan DLavie OS atau langsung gunakan AI Workspace.',
  },
  { en: 'Login', id: 'Masuk' },
  { en: 'Register', id: 'Daftar' },
  { en: 'Secure access', id: 'Akses aman' },
  { en: 'Create account', id: 'Buat akun' },
  { en: 'Email', id: 'Email' },
  { en: 'Password', id: 'Kata sandi' },
  { en: 'Password strength', id: 'Kekuatan kata sandi' },
  { en: 'Weak', id: 'Lemah' },
  { en: 'Continue to account', id: 'Lanjut ke akun' },
  { en: 'Sign in to DLavie', id: 'Masuk ke DLavie' },
  { en: 'Create a DLavie account', id: 'Buat akun DLavie' },
  { en: 'Already have an account?', id: 'Sudah punya akun?' },
  { en: 'Don’t have an account?', id: 'Belum punya akun?' },
  { en: 'Shop', id: 'Belanja' },
  { en: 'Categories', id: 'Kategori' },
  { en: 'Catalog', id: 'Katalog' },
  { en: 'About', id: 'Tentang' },
  { en: 'Account', id: 'Akun' },
  { en: 'Cart', id: 'Keranjang' },
  {
    en: 'Prices and stock are updated directly from the commerce system',
    id: 'Harga dan stok diperbarui langsung dari sistem commerce',
  },
  { en: 'DLavie collection', id: 'Koleksi DLavie' },
  {
    en: 'Shop with less friction and fewer distractions.',
    id: 'Belanja lebih mudah, tanpa distraksi.',
  },
  {
    en: 'Discover DLavie products through a clear catalog, transparent pricing, and live stock information.',
    id: 'Temukan produk DLavie melalui katalog yang jelas, harga transparan, dan informasi stok terkini.',
  },
  { en: 'Live data', id: 'Data langsung' },
  {
    en: 'Prices and stock are read directly from the system.',
    id: 'Harga dan stok dibaca langsung dari sistem.',
  },
  { en: 'Structured catalog', id: 'Katalog terstruktur' },
  {
    en: 'Find and filter categories quickly.',
    id: 'Cari dan pilih kategori dengan cepat.',
  },
  { en: 'Protected checkout', id: 'Checkout terlindungi' },
  {
    en: 'Transaction data is processed securely on the server.',
    id: 'Data transaksi diproses secara aman melalui server.',
  },
  { en: 'Find the right product', id: 'Temukan produk yang tepat' },
  {
    en: 'Search by name or browse available categories.',
    id: 'Cari berdasarkan nama atau jelajahi kategori yang tersedia.',
  },
  { en: 'Search product name', id: 'Cari nama produk' },
  { en: 'Search products', id: 'Cari produk' },
  { en: 'All products', id: 'Semua produk' },
  { en: 'Clear filter', id: 'Hapus filter' },
  { en: 'Image not available', id: 'Gambar belum tersedia' },
  { en: 'Out of stock', id: 'Stok habis' },
  { en: 'Starting from', id: 'Mulai dari' },
  { en: 'View product', id: 'Lihat produk' },
  { en: 'No matching products yet', id: 'Belum ada produk yang cocok' },
  {
    en: 'Try another search term or category. No sample products are shown.',
    id: 'Ubah kata pencarian atau kategori. Tidak ada produk contoh yang ditampilkan.',
  },
  { en: 'View full catalog', id: 'Lihat seluruh katalog' },
  { en: 'Previous', id: 'Sebelumnya' },
  { en: 'Next', id: 'Berikutnya' },
  { en: 'Page', id: 'Halaman' },
  { en: 'Commerce is not available yet', id: 'Commerce belum tersedia' },
  {
    en: 'The catalog is temporarily unavailable',
    id: 'Katalog sedang tidak dapat diakses',
  },
  { en: 'The backend is not configured', id: 'Backend belum dikonfigurasi' },
  { en: 'Back to DLavie', id: 'Kembali ke DLavie' },
  { en: 'Welcome', id: 'Selamat datang' },
  { en: 'Open shop', id: 'Buka toko' },
  { en: 'Sign out', id: 'Keluar' },
  { en: 'Workspace', id: 'Workspace' },
  { en: 'Personal access', id: 'Akses personal' },
  { en: 'Product interest', id: 'Minat produk' },
  { en: 'Security', id: 'Keamanan' },
];

const toId = new Map(PHRASES.map((item) => [item.en, item.id]));
const toEn = new Map(PHRASES.map((item) => [item.id, item.en]));

export function translateKnownPhrase(value: string, locale: DlavieLocale): string {
  const trimmed = value.trim();
  if (!trimmed) return value;
  const translated = locale === 'id' ? toId.get(trimmed) : toEn.get(trimmed);
  if (!translated || translated === trimmed) return value;
  const start = value.slice(0, value.indexOf(trimmed));
  const end = value.slice(value.indexOf(trimmed) + trimmed.length);
  return `${start}${translated}${end}`;
}
