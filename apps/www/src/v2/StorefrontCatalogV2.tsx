import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronRight,
  CreditCard,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Wifi,
  Zap,
} from 'lucide-react';
import { formatIdr } from '../commerce/format';
import type { CatalogCategory, CatalogProduct } from '../commerce/types';
import styles from './storefront.module.css';

type Locale = 'id' | 'en';

type Props = {
  locale: Locale;
  categories: CatalogCategory[];
  products: CatalogProduct[];
  totalProducts: number;
  query?: string;
  category?: string;
  serviceUnavailable?: boolean;
};

const copy = {
  id: {
    products: 'Produk',
    categories: 'Kategori',
    orders: 'Pesanan',
    signIn: 'Masuk',
    cart: 'Keranjang',
    eyebrow: 'Commerce digital yang dibuat untuk Indonesia',
    title: 'Temukan produk digital tanpa alur yang membingungkan.',
    description:
      'Cari produk, pilih nominal, isi data tujuan, lalu lanjutkan ke pembayaran dalam satu pengalaman yang konsisten.',
    searchPlaceholder: 'Cari pulsa, paket data, voucher, atau tagihan',
    search: 'Cari',
    proofCatalog: 'Katalog Digiflazz',
    proofPayment: 'Pembayaran Midtrans',
    proofCurrency: 'Harga dalam IDR',
    liveCatalog: 'Katalog aktif',
    popular: 'Kategori populer',
    viewAll: 'Lihat semua',
    catalogTitle: 'Produk yang tersedia sekarang.',
    catalogCopy: 'Harga dan ketersediaan berasal dari backend commerce, bukan data contoh.',
    all: 'Semua produk',
    available: 'Tersedia',
    unavailable: 'Belum tersedia',
    from: 'Mulai',
    emptyTitle: 'Katalog belum terisi',
    emptyCopy: 'Produk akan muncul setelah sinkronisasi Digiflazz selesai.',
    serviceTitle: 'Katalog sedang tidak dapat diakses',
    serviceCopy: 'Tidak ada produk palsu yang ditampilkan saat backend bermasalah.',
    trustCatalog: 'Data produk dari Digiflazz',
    trustPayment: 'Pembayaran melalui Midtrans',
    trustServer: 'Credential hanya di server',
    processTitle: 'Alur transaksi yang mudah dipahami.',
    stepOne: 'Pilih produk',
    stepTwo: 'Isi data tujuan',
    stepThree: 'Bayar dan pantau',
  },
  en: {
    products: 'Products',
    categories: 'Categories',
    orders: 'Orders',
    signIn: 'Sign in',
    cart: 'Cart',
    eyebrow: 'Digital commerce built for Indonesia',
    title: 'Find digital products without a confusing purchase flow.',
    description:
      'Search products, choose an amount, enter the destination, and continue to payment in one consistent experience.',
    searchPlaceholder: 'Search mobile credit, data, vouchers, or bills',
    search: 'Search',
    proofCatalog: 'Digiflazz catalog',
    proofPayment: 'Midtrans payments',
    proofCurrency: 'IDR pricing',
    liveCatalog: 'Live catalog',
    popular: 'Popular categories',
    viewAll: 'View all',
    catalogTitle: 'Products available now.',
    catalogCopy: 'Prices and availability come from the commerce backend, not sample data.',
    all: 'All products',
    available: 'Available',
    unavailable: 'Unavailable',
    from: 'From',
    emptyTitle: 'The catalog is not populated yet',
    emptyCopy: 'Products will appear after the Digiflazz synchronization completes.',
    serviceTitle: 'The catalog is currently unavailable',
    serviceCopy: 'No fabricated products are displayed when the backend is unavailable.',
    trustCatalog: 'Product data from Digiflazz',
    trustPayment: 'Payments through Midtrans',
    trustServer: 'Credentials stay server-side',
    processTitle: 'A transaction flow that is easy to understand.',
    stepOne: 'Choose a product',
    stepTwo: 'Enter the destination',
    stepThree: 'Pay and follow',
  },
} as const;

const categoryIcons = [Smartphone, Wifi, Zap, ShoppingBag];

function productHref(slug: string): string {
  return `/v2/product/${encodeURIComponent(slug)}`;
}

function initial(value: string): string {
  return value.trim().slice(0, 1).toUpperCase() || 'D';
}

export function StorefrontCatalogV2({
  locale,
  categories,
  products,
  totalProducts,
  query,
  category,
  serviceUnavailable = false,
}: Props) {
  const t = copy[locale];
  const featuredCategories = categories.slice(0, 4);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/v2" aria-label="DLavie Commerce">
            <span className={styles.brandMark} aria-hidden="true">
              DL
            </span>
            <span className={styles.brandCopy}>
              <strong>DLavie</strong>
              <small>Commerce v2</small>
            </span>
          </Link>

          <nav className={styles.navigation} aria-label="Storefront navigation">
            <a href="#catalog">{t.products}</a>
            <a href="#categories">{t.categories}</a>
            <Link href="/v2/orders">{t.orders}</Link>
          </nav>

          <div className={styles.headerActions}>
            <Link className={styles.signIn} href="/account/login">
              {t.signIn}
            </Link>
            <Link className={styles.cartButton} href="/v2/cart" aria-label={t.cart}>
              <ShoppingBag size={18} aria-hidden="true" />
              <span>{t.cart}</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p className={styles.heroDescription}>{t.description}</p>

            <form className={styles.heroSearch} action="/v2#catalog" method="get">
              <Search size={20} aria-hidden="true" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                minLength={2}
                maxLength={100}
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
              />
              <button type="submit">{t.search}</button>
            </form>

            <div className={styles.heroProof}>
              <span>
                <Check size={15} aria-hidden="true" /> {t.proofCatalog}
              </span>
              <span>
                <Check size={15} aria-hidden="true" /> {t.proofPayment}
              </span>
              <span>
                <Check size={15} aria-hidden="true" /> {t.proofCurrency}
              </span>
            </div>
          </div>

          <div className={styles.heroPanel} aria-label="DLavie Commerce overview">
            <div className={styles.heroPanelTop}>
              <span>DLavie Commerce</span>
              <i aria-label="Online" />
            </div>
            <div className={styles.heroPanelMetric}>
              <strong>{totalProducts}</strong>
              <span>{t.liveCatalog}</span>
            </div>
            <div className={styles.heroPanelProducts}>
              {products.slice(0, 3).map((product, index) => {
                const variant = product.variants[0];
                return (
                  <Link key={product.id} href={productHref(product.slug)}>
                    <span className={styles.heroProductIndex}>0{index + 1}</span>
                    <span className={styles.heroProductCopy}>
                      <small>{product.category?.name ?? 'Digital'}</small>
                      <strong>{product.name}</strong>
                    </span>
                    <b>{variant ? formatIdr(variant.priceAmount) : '—'}</b>
                  </Link>
                );
              })}
              {products.length === 0 ? (
                <div className={styles.heroPanelEmpty}>{t.emptyCopy}</div>
              ) : null}
            </div>
          </div>
        </section>

        <section className={styles.categories} id="categories" aria-labelledby="v2-categories-title">
          <div className={styles.sectionHeading}>
            <div>
              <p>{t.popular}</p>
              <h2 id="v2-categories-title">{t.categories}</h2>
            </div>
            <a href="#catalog">
              {t.viewAll} <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>

          <div className={styles.categoryGrid}>
            {featuredCategories.map((item, index) => {
              const Icon = categoryIcons[index % categoryIcons.length] ?? ShoppingBag;
              return (
                <Link key={item.id} href={`/v2?category=${encodeURIComponent(item.slug)}#catalog`}>
                  <span className={styles.categoryIcon}>
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className={styles.categoryCopy}>
                    <strong>{item.name}</strong>
                    <small>{item.description ?? 'DLavie Commerce'}</small>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              );
            })}
            {featuredCategories.length === 0
              ? ['Pulsa & data', 'Voucher digital', 'Tagihan', 'Layanan lainnya'].map(
                  (label, index) => {
                    const Icon = categoryIcons[index % categoryIcons.length] ?? ShoppingBag;
                    return (
                      <div key={label} className={styles.categoryPlaceholder}>
                        <span className={styles.categoryIcon}>
                          <Icon size={22} aria-hidden="true" />
                        </span>
                        <span className={styles.categoryCopy}>
                          <strong>{label}</strong>
                          <small>{t.emptyTitle}</small>
                        </span>
                      </div>
                    );
                  },
                )
              : null}
          </div>
        </section>

        <section className={styles.catalog} id="catalog" aria-labelledby="v2-catalog-title">
          <div className={styles.catalogHeading}>
            <div>
              <p>{t.liveCatalog}</p>
              <h2 id="v2-catalog-title">{t.catalogTitle}</h2>
            </div>
            <span>{t.catalogCopy}</span>
          </div>

          <div className={styles.catalogLayout}>
            <aside className={styles.filters} aria-label={t.categories}>
              <Link className={!category ? styles.activeFilter : undefined} href="/v2#catalog">
                {t.all}
                <small>{totalProducts}</small>
              </Link>
              {categories.map((item) => (
                <Link
                  key={item.id}
                  className={category === item.slug ? styles.activeFilter : undefined}
                  href={`/v2?category=${encodeURIComponent(item.slug)}#catalog`}
                >
                  {item.name}
                  <ChevronRight size={15} aria-hidden="true" />
                </Link>
              ))}
            </aside>

            <div className={styles.catalogContent}>
              {serviceUnavailable ? (
                <div className={styles.emptyState}>
                  <ShieldCheck size={28} aria-hidden="true" />
                  <h3>{t.serviceTitle}</h3>
                  <p>{t.serviceCopy}</p>
                </div>
              ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                  <PackageCheck size={28} aria-hidden="true" />
                  <h3>{t.emptyTitle}</h3>
                  <p>{t.emptyCopy}</p>
                </div>
              ) : (
                <div className={styles.productGrid}>
                  {products.map((product) => {
                    const variant = product.variants[0];
                    const available = Boolean(variant && variant.availableQuantity > 0);
                    return (
                      <article key={product.id} className={styles.productCard}>
                        <Link className={styles.productVisual} href={productHref(product.slug)}>
                          <span>{initial(product.category?.name ?? product.name)}</span>
                          <small>{product.category?.name ?? 'Digital'}</small>
                        </Link>
                        <div className={styles.productBody}>
                          <div className={styles.productStatus} data-available={available}>
                            <i /> {available ? t.available : t.unavailable}
                          </div>
                          <h3>
                            <Link href={productHref(product.slug)}>{product.name}</Link>
                          </h3>
                          <p>{product.description}</p>
                          <div className={styles.productFooter}>
                            <span>
                              <small>{t.from}</small>
                              <strong>{variant ? formatIdr(variant.priceAmount) : '—'}</strong>
                            </span>
                            <Link href={productHref(product.slug)} aria-label={product.name}>
                              <ArrowRight size={17} aria-hidden="true" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={styles.trustBar} aria-label="Commerce safeguards">
          <div>
            <PackageCheck size={21} aria-hidden="true" />
            <span>{t.trustCatalog}</span>
          </div>
          <div>
            <CreditCard size={21} aria-hidden="true" />
            <span>{t.trustPayment}</span>
          </div>
          <div>
            <ShieldCheck size={21} aria-hidden="true" />
            <span>{t.trustServer}</span>
          </div>
        </section>

        <section className={styles.process} aria-labelledby="v2-process-title">
          <div className={styles.processIntro}>
            <p>DLavie Commerce v2</p>
            <h2 id="v2-process-title">{t.processTitle}</h2>
          </div>
          <div className={styles.processGrid}>
            <article>
              <span>01</span>
              <Smartphone size={24} aria-hidden="true" />
              <h3>{t.stepOne}</h3>
            </article>
            <article>
              <span>02</span>
              <Wifi size={24} aria-hidden="true" />
              <h3>{t.stepTwo}</h3>
            </article>
            <article>
              <span>03</span>
              <CreditCard size={24} aria-hidden="true" />
              <h3>{t.stepThree}</h3>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
