import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronRight,
  CreditCard,
  Headphones,
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

type StorefrontV2Props = {
  locale: Locale;
  categories: CatalogCategory[];
  products: CatalogProduct[];
  totalProducts: number;
  query?: string;
  category?: string;
  serviceUnavailable?: boolean;
};

const dictionary = {
  id: {
    navProducts: 'Produk',
    navCategories: 'Kategori',
    navOrders: 'Pesanan',
    signIn: 'Masuk',
    cart: 'Keranjang',
    eyebrow: 'Produk digital untuk kebutuhan sehari-hari',
    title: 'Transaksi digital yang cepat, jelas, dan dapat dipercaya.',
    description:
      'Pilih produk dari katalog Digiflazz, bayar dengan aman melalui Midtrans, lalu pantau status pesanan dalam satu alur yang rapi.',
    searchPlaceholder: 'Cari pulsa, paket data, voucher, atau tagihan',
    searchButton: 'Cari',
    popular: 'Kategori populer',
    viewAll: 'Lihat semua',
    liveCatalog: 'Katalog aktif',
    catalogTitle: 'Pilih produk yang kamu butuhkan.',
    catalogDescription:
      'Semua nama, harga, dan ketersediaan berasal dari sistem commerce. Kami tidak menampilkan produk contoh.',
    allProducts: 'Semua produk',
    from: 'Mulai',
    available: 'Tersedia',
    unavailable: 'Belum tersedia',
    openProduct: 'Lihat produk',
    emptyTitle: 'Katalog belum terisi',
    emptyDescription:
      'Produk akan tampil setelah sinkronisasi Digiflazz selesai. Struktur halaman tetap siap tanpa data palsu.',
    serviceTitle: 'Katalog sedang tidak dapat diakses',
    serviceDescription:
      'Storefront tidak mengganti kegagalan backend dengan produk palsu. Silakan periksa kembali setelah layanan pulih.',
    trustOne: 'Data produk dari Digiflazz',
    trustTwo: 'Pembayaran melalui Midtrans',
    trustThree: 'Credential aman di server',
    processEyebrow: 'Alur sederhana',
    processTitle: 'Dari pilihan produk sampai pesanan selesai.',
    stepOneTitle: 'Pilih layanan',
    stepOneCopy: 'Cari produk atau buka kategori yang sesuai dengan kebutuhanmu.',
    stepTwoTitle: 'Isi data tujuan',
    stepTwoCopy: 'Masukkan nomor atau identitas pelanggan yang diminta oleh produk.',
    stepThreeTitle: 'Bayar dan pantau',
    stepThreeCopy: 'Selesaikan pembayaran lalu lihat status transaksi dari halaman pesanan.',
    footerCopy: 'Commerce digital yang fokus pada katalog, checkout, dan pesanan.',
    powered: 'Katalog Digiflazz · Pembayaran Midtrans',
  },
  en: {
    navProducts: 'Products',
    navCategories: 'Categories',
    navOrders: 'Orders',
    signIn: 'Sign in',
    cart: 'Cart',
    eyebrow: 'Digital products for everyday needs',
    title: 'Digital transactions that feel fast, clear, and trustworthy.',
    description:
      'Choose from the Digiflazz catalog, pay securely through Midtrans, and follow each order in one coherent flow.',
    searchPlaceholder: 'Search mobile credit, data, vouchers, or bills',
    searchButton: 'Search',
    popular: 'Popular categories',
    viewAll: 'View all',
    liveCatalog: 'Live catalog',
    catalogTitle: 'Choose the product you need.',
    catalogDescription:
      'Names, prices, and availability come from the commerce system. No sample products are displayed.',
    allProducts: 'All products',
    from: 'From',
    available: 'Available',
    unavailable: 'Unavailable',
    openProduct: 'View product',
    emptyTitle: 'The catalog is not populated yet',
    emptyDescription:
      'Products will appear after the Digiflazz sync completes. The storefront remains intentional without fake data.',
    serviceTitle: 'The catalog is currently unavailable',
    serviceDescription:
      'The storefront does not replace backend failures with fabricated products. Please check again after the service recovers.',
    trustOne: 'Product data from Digiflazz',
    trustTwo: 'Payments through Midtrans',
    trustThree: 'Credentials stay server-side',
    processEyebrow: 'A simple flow',
    processTitle: 'From product choice to a completed order.',
    stepOneTitle: 'Choose a service',
    stepOneCopy: 'Search the catalog or open the category that matches your need.',
    stepTwoTitle: 'Enter the destination',
    stepTwoCopy: 'Provide the number or customer identity required by the product.',
    stepThreeTitle: 'Pay and follow',
    stepThreeCopy: 'Complete payment and check transaction progress from the order page.',
    footerCopy: 'Digital commerce focused on catalog, checkout, and orders.',
    powered: 'Digiflazz catalog · Midtrans payments',
  },
} as const;

const categoryIcons = [Smartphone, Wifi, Zap, ShoppingBag];

function initial(value: string): string {
  return value.trim().slice(0, 1).toUpperCase() || 'D';
}

function productHref(slug: string): string {
  return `/shop/${encodeURIComponent(slug)}`;
}

export function StorefrontV2({
  locale,
  categories,
  products,
  totalProducts,
  query,
  category,
  serviceUnavailable = false,
}: StorefrontV2Props) {
  const t = dictionary[locale];
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
              <small>Commerce</small>
            </span>
          </Link>

          <nav className={styles.navigation} aria-label="Storefront navigation">
            <a href="#catalog">{t.navProducts}</a>
            <a href="#categories">{t.navCategories}</a>
            <Link href="/orders">{t.navOrders}</Link>
          </nav>

          <div className={styles.headerActions}>
            <Link className={styles.signIn} href="/account/login">
              {t.signIn}
            </Link>
            <Link className={styles.cartButton} href="/cart" aria-label={t.cart}>
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
              <button type="submit">{t.searchButton}</button>
            </form>

            <div className={styles.heroProof}>
              <span>
                <Check size={15} aria-hidden="true" /> Digiflazz
              </span>
              <span>
                <Check size={15} aria-hidden="true" /> Midtrans
              </span>
              <span>
                <Check size={15} aria-hidden="true" /> IDR
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
                <div className={styles.heroPanelEmpty}>{t.emptyDescription}</div>
              ) : null}
            </div>
          </div>
        </section>

        <section className={styles.categories} id="categories" aria-labelledby="v2-categories-title">
          <div className={styles.sectionHeading}>
            <div>
              <p>{t.popular}</p>
              <h2 id="v2-categories-title">{t.navCategories}</h2>
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
            <span>{t.catalogDescription}</span>
          </div>

          <div className={styles.catalogLayout}>
            <aside className={styles.filters} aria-label={t.navCategories}>
              <Link className={!category ? styles.activeFilter : undefined} href="/v2#catalog">
                {t.allProducts}
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
                  <p>{t.serviceDescription}</p>
                </div>
              ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                  <PackageCheck size={28} aria-hidden="true" />
                  <h3>{t.emptyTitle}</h3>
                  <p>{t.emptyDescription}</p>
                </div>
              ) : (
                <div className={styles.productGrid}>
                  {products.map((product) => {
                    const variant = product.variants[0];
                    const isAvailable = Boolean(variant && variant.availableQuantity > 0);
                    return (
                      <article key={product.id} className={styles.productCard}>
                        <Link className={styles.productVisual} href={productHref(product.slug)}>
                          <span>{initial(product.category?.name ?? product.name)}</span>
                          <small>{product.category?.name ?? 'Digital'}</small>
                        </Link>
                        <div className={styles.productBody}>
                          <div className={styles.productStatus} data-available={isAvailable}>
                            <i /> {isAvailable ? t.available : t.unavailable}
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
                            <Link href={productHref(product.slug)} aria-label={`${t.openProduct}: ${product.name}`}>
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
            <span>{t.trustOne}</span>
          </div>
          <div>
            <CreditCard size={21} aria-hidden="true" />
            <span>{t.trustTwo}</span>
          </div>
          <div>
            <ShieldCheck size={21} aria-hidden="true" />
            <span>{t.trustThree}</span>
          </div>
        </section>

        <section className={styles.process} aria-labelledby="v2-process-title">
          <div className={styles.processIntro}>
            <p>{t.processEyebrow}</p>
            <h2 id="v2-process-title">{t.processTitle}</h2>
          </div>
          <div className={styles.processGrid}>
            <article>
              <span>01</span>
              <Smartphone size={24} aria-hidden="true" />
              <h3>{t.stepOneTitle}</h3>
              <p>{t.stepOneCopy}</p>
            </article>
            <article>
              <span>02</span>
              <Headphones size={24} aria-hidden="true" />
              <h3>{t.stepTwoTitle}</h3>
              <p>{t.stepTwoCopy}</p>
            </article>
            <article>
              <span>03</span>
              <CreditCard size={24} aria-hidden="true" />
              <h3>{t.stepThreeTitle}</h3>
              <p>{t.stepThreeCopy}</p>
            </article>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div>
          <Link className={styles.footerBrand} href="/v2">
            DLavie <span>Commerce</span>
          </Link>
          <p>{t.footerCopy}</p>
        </div>
        <small>{t.powered}</small>
      </footer>
    </div>
  );
}
