import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Layers,
  PackageSearch,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Ticket,
  Zap,
} from 'lucide-react';
import { CommerceHeader } from '../../src/components/commerce/CommerceHeader';
import { CommerceConfigurationError } from '../../src/commerce/config';
import { formatIdr } from '../../src/commerce/format';
import {
  CommerceApiError,
  getCatalogCategories,
  getCatalogProducts,
} from '../../src/commerce/server';
import type { CatalogCategory, CatalogProduct } from '../../src/commerce/types';
import { getRequestLocale } from '../../src/i18n/server';

const copy = {
  en: {
    title: 'DLavie Commerce — Indonesian Digital Products',
    description:
      'Buy mobile credit, data packages, digital vouchers, and everyday digital products through DLavie Commerce.',
    heroEyebrow: 'Digital commerce for Indonesia',
    heroTitle: 'Everyday digital products, in one focused storefront.',
    heroCopy:
      'Browse a live catalog sourced from Digiflazz, choose the product you need, and complete payment securely through Midtrans.',
    browseProducts: 'Browse products',
    trackOrder: 'Track an order',
    realCatalog: 'Live provider catalog',
    secureCheckout: 'Server-protected checkout',
    orderVisibility: 'Trackable order status',
    liveStatus: 'Commerce system online',
    providerCatalog: 'Product source',
    providerCatalogCopy: 'Catalog and pricing synchronized from Digiflazz.',
    paymentGateway: 'Payment gateway',
    paymentGatewayCopy: 'Checkout and payment confirmation handled by Midtrans.',
    liveSelection: 'Available from the catalog',
    noProductsYet: 'Products will appear here after the provider catalog is synchronized.',
    categoriesMetric: 'categories',
    productsMetric: 'products',
    paymentMetric: 'Midtrans payment',
    categoriesEyebrow: 'Explore faster',
    categoriesTitle: 'Start from the service you need.',
    categoriesCopy:
      'Categories are generated from the active provider catalog, so this homepage stays useful without showing sample products.',
    openCategory: 'Open category',
    fallbackCatalogTitle: 'Provider catalog',
    fallbackCatalogCopy: 'Digiflazz synchronization keeps product information organized.',
    fallbackPaymentTitle: 'Secure payment',
    fallbackPaymentCopy: 'Midtrans handles the payment flow and transaction confirmation.',
    fallbackOrderTitle: 'Order visibility',
    fallbackOrderCopy: 'Customers can return to check their order status.',
    benefitsLabel: 'Commerce service advantages',
    liveData: 'Provider-sourced data',
    liveDataCopy: 'Product names, prices, and availability come from the commerce system.',
    structured: 'Simple discovery',
    structuredCopy: 'Search and category navigation keep a large catalog easy to browse.',
    protected: 'Protected checkout',
    protectedCopy: 'Sensitive provider credentials remain on the server.',
    catalog: 'Live catalog',
    catalogTitle: 'Find the right digital product',
    catalogCopy: 'Search by product name or browse an active category.',
    searchPlaceholder: 'Search product name',
    searchLabel: 'Search products',
    searchButton: 'Search',
    categories: 'Categories',
    categoryNav: 'Product categories',
    allProducts: 'All products',
    products: 'products',
    forQuery: 'for',
    clearFilter: 'Clear filter',
    productList: 'Product list',
    view: 'View',
    imageMissing: 'Image not available',
    soldOut: 'Out of stock',
    startingFrom: 'Starting from',
    viewProduct: 'View product',
    emptyTitle: 'No matching products yet',
    emptyCopy: 'Try another search term or category. No sample products are shown.',
    fullCatalog: 'View full catalog',
    pagination: 'Catalog pages',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    processEyebrow: 'A clearer purchase flow',
    processTitle: 'From product discovery to payment in three steps.',
    processCopy:
      'The storefront keeps product selection, checkout, and order visibility in one consistent experience.',
    stepOne: 'Choose a product',
    stepOneCopy: 'Search the catalog or open a category that matches your current need.',
    stepTwo: 'Review and pay',
    stepTwoCopy: 'Confirm the product and complete the protected Midtrans payment flow.',
    stepThree: 'Follow the order',
    stepThreeCopy: 'Use the order page to check transaction and processing status.',
    closingEyebrow: 'DLavie Commerce',
    closingTitle: 'A focused home for digital transactions.',
    closingCopy:
      'No AI workspace, operating system, or unrelated product story—only catalog, checkout, and orders.',
    closingAction: 'Start shopping',
    unavailable: 'Commerce is not available yet',
    catalogUnavailable: 'The catalog is temporarily unavailable',
    backendMissing: 'The backend is not configured',
    invalidResponse:
      'The commerce service did not return a valid response. No local or fake product data is used as a replacement.',
    connectDatabase: 'Connect the commerce database before opening the store.',
    back: 'Return to storefront',
  },
  id: {
    title: 'DLavie Commerce — Produk Digital Indonesia',
    description:
      'Beli pulsa, paket data, voucher digital, dan produk pembayaran harian melalui DLavie Commerce.',
    heroEyebrow: 'Commerce digital untuk Indonesia',
    heroTitle: 'Semua kebutuhan digital harian, dalam satu toko yang fokus.',
    heroCopy:
      'Jelajahi katalog aktif dari Digiflazz, pilih produk yang dibutuhkan, lalu selesaikan pembayaran dengan aman melalui Midtrans.',
    browseProducts: 'Lihat semua produk',
    trackOrder: 'Lacak pesanan',
    realCatalog: 'Katalog provider aktif',
    secureCheckout: 'Checkout terlindungi server',
    orderVisibility: 'Status pesanan dapat dilacak',
    liveStatus: 'Sistem commerce aktif',
    providerCatalog: 'Sumber produk',
    providerCatalogCopy: 'Katalog dan harga disinkronkan dari Digiflazz.',
    paymentGateway: 'Payment gateway',
    paymentGatewayCopy: 'Checkout dan konfirmasi pembayaran ditangani Midtrans.',
    liveSelection: 'Tersedia dari katalog',
    noProductsYet: 'Produk akan muncul di sini setelah katalog provider disinkronkan.',
    categoriesMetric: 'kategori',
    productsMetric: 'produk',
    paymentMetric: 'Pembayaran Midtrans',
    categoriesEyebrow: 'Jelajahi lebih cepat',
    categoriesTitle: 'Mulai dari layanan yang Anda butuhkan.',
    categoriesCopy:
      'Kategori dibentuk dari katalog provider aktif sehingga homepage tetap berguna tanpa menampilkan produk contoh.',
    openCategory: 'Buka kategori',
    fallbackCatalogTitle: 'Katalog provider',
    fallbackCatalogCopy: 'Sinkronisasi Digiflazz menjaga informasi produk tetap terstruktur.',
    fallbackPaymentTitle: 'Pembayaran aman',
    fallbackPaymentCopy: 'Midtrans menangani alur pembayaran dan konfirmasi transaksi.',
    fallbackOrderTitle: 'Status pesanan',
    fallbackOrderCopy: 'Pelanggan dapat kembali untuk memeriksa status pesanannya.',
    benefitsLabel: 'Keunggulan layanan commerce',
    liveData: 'Data dari provider',
    liveDataCopy: 'Nama, harga, dan ketersediaan produk berasal dari sistem commerce.',
    structured: 'Mudah dijelajahi',
    structuredCopy: 'Pencarian dan kategori membuat katalog besar tetap mudah digunakan.',
    protected: 'Checkout terlindungi',
    protectedCopy: 'Credential provider yang sensitif tetap berada di server.',
    catalog: 'Katalog aktif',
    catalogTitle: 'Temukan produk digital yang tepat',
    catalogCopy: 'Cari berdasarkan nama produk atau jelajahi kategori yang tersedia.',
    searchPlaceholder: 'Cari nama produk',
    searchLabel: 'Cari produk',
    searchButton: 'Cari produk',
    categories: 'Kategori',
    categoryNav: 'Kategori produk',
    allProducts: 'Semua produk',
    products: 'produk',
    forQuery: 'untuk',
    clearFilter: 'Hapus filter',
    productList: 'Daftar produk',
    view: 'Lihat',
    imageMissing: 'Gambar belum tersedia',
    soldOut: 'Stok habis',
    startingFrom: 'Mulai dari',
    viewProduct: 'Lihat produk',
    emptyTitle: 'Belum ada produk yang cocok',
    emptyCopy: 'Ubah kata pencarian atau kategori. Tidak ada produk contoh yang ditampilkan.',
    fullCatalog: 'Lihat seluruh katalog',
    pagination: 'Halaman katalog',
    previous: 'Sebelumnya',
    next: 'Berikutnya',
    page: 'Halaman',
    of: 'dari',
    processEyebrow: 'Alur pembelian yang jelas',
    processTitle: 'Dari memilih produk hingga pembayaran dalam tiga langkah.',
    processCopy:
      'Storefront menyatukan pemilihan produk, checkout, dan pelacakan pesanan dalam satu pengalaman yang konsisten.',
    stepOne: 'Pilih produk',
    stepOneCopy: 'Cari melalui katalog atau buka kategori yang sesuai dengan kebutuhan saat ini.',
    stepTwo: 'Periksa dan bayar',
    stepTwoCopy: 'Konfirmasi produk lalu selesaikan pembayaran melalui alur Midtrans yang terlindungi.',
    stepThree: 'Pantau pesanan',
    stepThreeCopy: 'Gunakan halaman pesanan untuk memeriksa status transaksi dan pemrosesan.',
    closingEyebrow: 'DLavie Commerce',
    closingTitle: 'Satu rumah yang fokus untuk transaksi digital.',
    closingCopy:
      'Tanpa AI workspace, operating system, atau cerita produk lain—hanya katalog, checkout, dan pesanan.',
    closingAction: 'Mulai belanja',
    unavailable: 'Commerce belum tersedia',
    catalogUnavailable: 'Katalog sedang tidak dapat diakses',
    backendMissing: 'Backend belum dikonfigurasi',
    invalidResponse:
      'Layanan commerce tidak memberikan respons yang valid. Tidak ada data lokal atau produk palsu yang digunakan sebagai pengganti.',
    connectDatabase: 'Hubungkan database commerce sebelum membuka toko.',
    back: 'Kembali ke storefront',
  },
} as const;

type Labels = (typeof copy)[keyof typeof copy];
type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function pageHref(input: { page: number; query?: string; category?: string }): string {
  const search = new URLSearchParams();
  if (input.page > 1) search.set('page', String(input.page));
  if (input.query) search.set('q', input.query);
  if (input.category) search.set('category', input.category);
  const value = search.toString();
  return value ? `/shop?${value}` : '/shop';
}

function CommerceHomeHero({
  labels,
  categories,
  products,
  totalProducts,
}: {
  labels: Labels;
  categories: CatalogCategory[];
  products: CatalogProduct[];
  totalProducts: number;
}) {
  const featuredProducts = products.filter((product) => product.variants[0]).slice(0, 3);

  return (
    <section className="commerce-home-hero" aria-labelledby="commerce-title">
      <div className="commerce-home-hero__glow" aria-hidden="true" />
      <div className="commerce-home-hero__content">
        <p className="commerce-home-hero__eyebrow">{labels.heroEyebrow}</p>
        <h1 id="commerce-title">{labels.heroTitle}</h1>
        <p className="commerce-home-hero__copy">{labels.heroCopy}</p>

        <div className="commerce-home-hero__actions">
          <Link className="commerce-home-button commerce-home-button--primary" href="#catalog">
            {labels.browseProducts} <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link className="commerce-home-button commerce-home-button--secondary" href="/orders">
            <ReceiptText size={16} aria-hidden="true" /> {labels.trackOrder}
          </Link>
        </div>

        <div className="commerce-home-hero__assurances">
          <span>
            <CheckCircle2 size={15} aria-hidden="true" /> {labels.realCatalog}
          </span>
          <span>
            <ShieldCheck size={15} aria-hidden="true" /> {labels.secureCheckout}
          </span>
          <span>
            <Clock size={15} aria-hidden="true" /> {labels.orderVisibility}
          </span>
        </div>
      </div>

      <div className="commerce-home-board" aria-label="DLavie Commerce status">
        <div className="commerce-home-board__status">
          <span>
            <i aria-hidden="true" /> {labels.liveStatus}
          </span>
          <small>DLavie Commerce</small>
        </div>

        <div className="commerce-home-board__providers">
          <article>
            <div>
              <Layers size={19} aria-hidden="true" />
              <span>Digiflazz</span>
            </div>
            <strong>{labels.providerCatalog}</strong>
            <p>{labels.providerCatalogCopy}</p>
          </article>
          <article>
            <div>
              <CreditCard size={19} aria-hidden="true" />
              <span>Midtrans</span>
            </div>
            <strong>{labels.paymentGateway}</strong>
            <p>{labels.paymentGatewayCopy}</p>
          </article>
        </div>

        <div className="commerce-home-board__catalog">
          <div className="commerce-home-board__catalog-heading">
            <span>{labels.liveSelection}</span>
            <ShoppingBag size={17} aria-hidden="true" />
          </div>
          {featuredProducts.length > 0 ? (
            <div className="commerce-home-board__products">
              {featuredProducts.map((product) => {
                const variant = product.variants[0];
                if (!variant) return null;
                return (
                  <Link key={product.id} href={`/shop/${encodeURIComponent(product.slug)}`}>
                    <span>
                      <small>{product.category?.name ?? 'DLavie'}</small>
                      <strong>{product.name}</strong>
                    </span>
                    <b>{formatIdr(variant.priceAmount)}</b>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="commerce-home-board__empty">{labels.noProductsYet}</p>
          )}
        </div>

        <div className="commerce-home-board__metrics">
          <div>
            <strong>{categories.length}</strong>
            <span>{labels.categoriesMetric}</span>
          </div>
          <div>
            <strong>{totalProducts}</strong>
            <span>{labels.productsMetric}</span>
          </div>
          <div>
            <BadgeCheck size={20} aria-hidden="true" />
            <span>{labels.paymentMetric}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommerceCategoryShowcase({
  labels,
  categories,
}: {
  labels: Labels;
  categories: CatalogCategory[];
}) {
  return (
    <section className="commerce-home-categories" id="categories" aria-labelledby="home-categories-title">
      <div className="commerce-home-section-heading">
        <div>
          <p className="commerce-eyebrow">{labels.categoriesEyebrow}</p>
          <h2 id="home-categories-title">{labels.categoriesTitle}</h2>
        </div>
        <p>{labels.categoriesCopy}</p>
      </div>

      <div className="commerce-home-category-grid">
        {categories.length > 0 ? (
          categories.slice(0, 6).map((item, index) => (
            <Link
              className="commerce-home-category-card"
              href={`${pageHref({ page: 1, category: item.slug })}#catalog`}
              key={item.id}
            >
              <span className="commerce-home-category-card__index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <Layers size={21} aria-hidden="true" />
                <h3>{item.name}</h3>
                <p>{item.description ?? labels.openCategory}</p>
              </div>
              <span className="commerce-home-category-card__link">
                {labels.openCategory} <ArrowRight size={15} aria-hidden="true" />
              </span>
            </Link>
          ))
        ) : (
          <>
            <article className="commerce-home-category-card commerce-home-category-card--static">
              <span className="commerce-home-category-card__index">01</span>
              <div>
                <RefreshCw size={21} aria-hidden="true" />
                <h3>{labels.fallbackCatalogTitle}</h3>
                <p>{labels.fallbackCatalogCopy}</p>
              </div>
            </article>
            <article className="commerce-home-category-card commerce-home-category-card--static">
              <span className="commerce-home-category-card__index">02</span>
              <div>
                <CreditCard size={21} aria-hidden="true" />
                <h3>{labels.fallbackPaymentTitle}</h3>
                <p>{labels.fallbackPaymentCopy}</p>
              </div>
            </article>
            <article className="commerce-home-category-card commerce-home-category-card--static">
              <span className="commerce-home-category-card__index">03</span>
              <div>
                <ReceiptText size={21} aria-hidden="true" />
                <h3>{labels.fallbackOrderTitle}</h3>
                <p>{labels.fallbackOrderCopy}</p>
              </div>
            </article>
          </>
        )}
      </div>
    </section>
  );
}

function CommerceTrustStrip({ labels }: { labels: Labels }) {
  return (
    <section className="commerce-home-trust" aria-label={labels.benefitsLabel}>
      <article>
        <RefreshCw size={20} aria-hidden="true" />
        <span>
          <strong>{labels.liveData}</strong>
          <small>{labels.liveDataCopy}</small>
        </span>
      </article>
      <article>
        <PackageSearch size={20} aria-hidden="true" />
        <span>
          <strong>{labels.structured}</strong>
          <small>{labels.structuredCopy}</small>
        </span>
      </article>
      <article>
        <ShieldCheck size={20} aria-hidden="true" />
        <span>
          <strong>{labels.protected}</strong>
          <small>{labels.protectedCopy}</small>
        </span>
      </article>
    </section>
  );
}

function CommerceProcess({ labels }: { labels: Labels }) {
  const steps = [
    {
      icon: Search,
      title: labels.stepOne,
      copy: labels.stepOneCopy,
    },
    {
      icon: CreditCard,
      title: labels.stepTwo,
      copy: labels.stepTwoCopy,
    },
    {
      icon: ReceiptText,
      title: labels.stepThree,
      copy: labels.stepThreeCopy,
    },
  ];

  return (
    <section className="commerce-home-process" aria-labelledby="commerce-process-title">
      <div className="commerce-home-section-heading commerce-home-section-heading--center">
        <div>
          <p className="commerce-eyebrow">{labels.processEyebrow}</p>
          <h2 id="commerce-process-title">{labels.processTitle}</h2>
        </div>
        <p>{labels.processCopy}</p>
      </div>

      <div className="commerce-home-process__grid">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article key={step.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div className="commerce-home-process__icon">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CommerceClosing({ labels }: { labels: Labels }) {
  return (
    <section className="commerce-home-closing">
      <div>
        <p>{labels.closingEyebrow}</p>
        <h2>{labels.closingTitle}</h2>
        <span>{labels.closingCopy}</span>
      </div>
      <Link href="#catalog">
        {labels.closingAction} <ArrowRight size={16} aria-hidden="true" />
      </Link>
      <div className="commerce-home-closing__marks" aria-hidden="true">
        <Smartphone size={22} />
        <Ticket size={22} />
        <Zap size={22} />
      </div>
    </section>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: copy[locale].title, description: copy[locale].description };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [resolved, locale] = await Promise.all([searchParams, getRequestLocale()]);
  const labels = copy[locale];
  const query = single(resolved.q)?.trim().slice(0, 100);
  const category = single(resolved.category)?.trim().slice(0, 120);
  const requestedPage = Number.parseInt(single(resolved.page) ?? '1', 10);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  try {
    const [catalog, categories] = await Promise.all([
      getCatalogProducts({ page, limit: 24, query, category }),
      getCatalogCategories(),
    ]);
    const totalPages = Math.max(1, Math.ceil(catalog.pagination.total / catalog.pagination.limit));

    return (
      <div className="commerce-page commerce-home-page">
        <CommerceHeader />
        <main className="commerce-shell commerce-shell--home">
          <CommerceHomeHero
            labels={labels}
            categories={categories}
            products={catalog.data}
            totalProducts={catalog.pagination.total}
          />
          <CommerceCategoryShowcase labels={labels} categories={categories} />
          <CommerceTrustStrip labels={labels} />

          <section className="commerce-catalog" id="catalog" aria-labelledby="catalog-title">
            <div className="commerce-catalog__heading">
              <div>
                <p className="commerce-eyebrow">{labels.catalog}</p>
                <h2 id="catalog-title">{labels.catalogTitle}</h2>
              </div>
              <p>{labels.catalogCopy}</p>
            </div>

            <form className="commerce-search" action="/shop#catalog" method="get">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                minLength={2}
                maxLength={100}
                placeholder={labels.searchPlaceholder}
                aria-label={labels.searchLabel}
              />
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <button type="submit">{labels.searchButton}</button>
            </form>

            <div className="commerce-catalog-layout">
              <aside
                className="commerce-category-nav"
                aria-labelledby="categories-title"
              >
                <div className="commerce-category-nav__heading">
                  <p id="categories-title">{labels.categories}</p>
                  <span>{categories.length}</span>
                </div>
                <nav aria-label={labels.categoryNav}>
                  <Link
                    href={pageHref({ page: 1, query }) + '#catalog'}
                    className={!category ? 'is-active' : undefined}
                  >
                    <span>{labels.allProducts}</span>
                    <small>{catalog.pagination.total}</small>
                  </Link>
                  {categories.map((item) => (
                    <Link
                      key={item.id}
                      href={pageHref({ page: 1, query, category: item.slug }) + '#catalog'}
                      className={category === item.slug ? 'is-active' : undefined}
                    >
                      <span>{item.name}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  ))}
                </nav>
              </aside>

              <div className="commerce-catalog-results">
                <div className="commerce-results-meta" aria-live="polite">
                  <p>
                    <strong>{catalog.pagination.total}</strong> {labels.products}
                    {query ? ` ${labels.forQuery} “${query}”` : ''}
                  </p>
                  {category ? (
                    <Link href={pageHref({ page: 1, query }) + '#catalog'}>
                      {labels.clearFilter}
                    </Link>
                  ) : null}
                </div>

                {catalog.data.length > 0 ? (
                  <section className="commerce-product-grid" aria-label={labels.productList}>
                    {catalog.data.map((product) => {
                      const variant = product.variants[0];
                      const image = product.images[0];
                      if (!variant) return null;

                      return (
                        <article className="commerce-product-card" key={product.id}>
                          <Link
                            className="commerce-product-card__media"
                            href={`/shop/${encodeURIComponent(product.slug)}`}
                            aria-label={`${labels.view} ${product.name}`}
                          >
                            {image ? (
                              <img src={image.url} alt={image.altText} loading="lazy" />
                            ) : (
                              <span className="commerce-product-card__no-image">
                                {labels.imageMissing}
                              </span>
                            )}
                            {variant.availableQuantity < 1 ? (
                              <span className="commerce-badge commerce-badge--sold">
                                {labels.soldOut}
                              </span>
                            ) : null}
                          </Link>
                          <div className="commerce-product-card__body">
                            <p className="commerce-product-card__category">
                              {product.category?.name ?? 'DLavie'}
                            </p>
                            <h2>
                              <Link href={`/shop/${encodeURIComponent(product.slug)}`}>
                                {product.name}
                              </Link>
                            </h2>
                            <p className="commerce-product-card__description">
                              {product.description}
                            </p>
                            <div className="commerce-product-card__footer">
                              <div>
                                <small>{labels.startingFrom}</small>
                                <strong>{formatIdr(variant.priceAmount)}</strong>
                              </div>
                              <Link
                                className="commerce-product-card__link"
                                href={`/shop/${encodeURIComponent(product.slug)}`}
                              >
                                {labels.viewProduct} <ArrowRight size={15} aria-hidden="true" />
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </section>
                ) : (
                  <section className="commerce-empty">
                    <h2>{labels.emptyTitle}</h2>
                    <p>{labels.emptyCopy}</p>
                    <Link className="commerce-button commerce-button--secondary" href="/shop">
                      {labels.fullCatalog}
                    </Link>
                  </section>
                )}

                {totalPages > 1 ? (
                  <nav className="commerce-pagination" aria-label={labels.pagination}>
                    {page > 1 ? (
                      <Link href={pageHref({ page: page - 1, query, category }) + '#catalog'}>
                        {labels.previous}
                      </Link>
                    ) : (
                      <span aria-disabled="true">{labels.previous}</span>
                    )}
                    <strong>
                      {labels.page} {page} {labels.of} {totalPages}
                    </strong>
                    {page < totalPages ? (
                      <Link href={pageHref({ page: page + 1, query, category }) + '#catalog'}>
                        {labels.next}
                      </Link>
                    ) : (
                      <span aria-disabled="true">{labels.next}</span>
                    )}
                  </nav>
                ) : null}
              </div>
            </div>
          </section>

          <CommerceProcess labels={labels} />
          <CommerceClosing labels={labels} />
        </main>
      </div>
    );
  } catch (error) {
    const configured = !(error instanceof CommerceConfigurationError);
    const unavailable = error instanceof CommerceApiError && error.status >= 500;

    return (
      <div className="commerce-page commerce-home-page">
        <CommerceHeader />
        <main className="commerce-shell commerce-shell--home">
          <CommerceHomeHero labels={labels} categories={[]} products={[]} totalProducts={0} />
          <CommerceCategoryShowcase labels={labels} categories={[]} />
          <CommerceTrustStrip labels={labels} />
          <section className="commerce-service-state commerce-service-state--home" role="alert">
            <p className="commerce-eyebrow">{labels.unavailable}</p>
            <h1>{configured ? labels.catalogUnavailable : labels.backendMissing}</h1>
            <p>{unavailable ? labels.invalidResponse : labels.connectDatabase}</p>
            <Link className="commerce-button commerce-button--secondary" href="/shop">
              {labels.back}
            </Link>
          </section>
          <CommerceProcess labels={labels} />
        </main>
      </div>
    );
  }
}
