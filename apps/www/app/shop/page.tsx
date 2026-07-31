import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, PackageSearch, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { CommerceHeader } from '../../src/components/commerce/CommerceHeader';
import { formatIdr } from '../../src/commerce/format';
import {
  CommerceApiError,
  getCatalogCategories,
  getCatalogProducts,
} from '../../src/commerce/server';
import { CommerceConfigurationError } from '../../src/commerce/config';
import { getRequestLocale } from '../../src/i18n/server';

const copy = {
  en: {
    title: 'DLavie Commerce — Product Catalog',
    description: 'Discover active DLavie products with current pricing and stock information.',
    collection: 'DLavie collection',
    heroTitle: 'Shop with less friction and fewer distractions.',
    heroCopy: 'Discover DLavie products through a clear catalog, transparent pricing, and live stock information from the commerce system.',
    principlesLabel: 'Commerce service advantages',
    liveData: 'Live data',
    liveDataCopy: 'Prices and stock are read directly from the system.',
    structured: 'Structured catalog',
    structuredCopy: 'Find and filter categories quickly.',
    protected: 'Protected checkout',
    protectedCopy: 'Transaction data is processed securely on the server.',
    catalog: 'Catalog',
    catalogTitle: 'Find the right product',
    catalogCopy: 'Search by name or browse available categories.',
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
    unavailable: 'Commerce is not available yet',
    catalogUnavailable: 'The catalog is temporarily unavailable',
    backendMissing: 'The backend is not configured',
    invalidResponse: 'The commerce service did not return a valid response. No local or fake product data is used as a replacement.',
    connectDatabase: 'Connect the commerce database before opening the store.',
    back: 'Back to DLavie',
  },
  id: {
    title: 'DLavie Commerce — Katalog Produk',
    description: 'Temukan produk aktif DLavie dengan harga dan ketersediaan stok terkini.',
    collection: 'Koleksi DLavie',
    heroTitle: 'Belanja lebih mudah, tanpa distraksi.',
    heroCopy: 'Temukan produk DLavie melalui katalog yang jelas, harga transparan, dan informasi stok yang diperbarui langsung dari sistem commerce.',
    principlesLabel: 'Keunggulan layanan commerce',
    liveData: 'Data langsung',
    liveDataCopy: 'Harga dan stok dibaca dari sistem.',
    structured: 'Katalog terstruktur',
    structuredCopy: 'Cari dan pilih kategori dengan cepat.',
    protected: 'Checkout terlindungi',
    protectedCopy: 'Data transaksi diproses melalui server.',
    catalog: 'Katalog',
    catalogTitle: 'Temukan produk yang tepat',
    catalogCopy: 'Cari berdasarkan nama atau jelajahi kategori yang tersedia.',
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
    unavailable: 'Commerce belum tersedia',
    catalogUnavailable: 'Katalog sedang tidak dapat diakses',
    backendMissing: 'Backend belum dikonfigurasi',
    invalidResponse: 'Layanan commerce tidak memberikan respons yang valid. Tidak ada data lokal atau produk palsu yang digunakan sebagai pengganti.',
    connectDatabase: 'Hubungkan database commerce sebelum membuka toko.',
    back: 'Kembali ke DLavie',
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: copy[locale].title, description: copy[locale].description };
}

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
      <div className="commerce-page">
        <CommerceHeader />
        <main className="commerce-shell">
          <section className="commerce-hero commerce-hero--catalog" aria-labelledby="commerce-title">
            <div className="commerce-hero__content">
              <p className="commerce-eyebrow">{labels.collection}</p>
              <h1 id="commerce-title">{labels.heroTitle}</h1>
              <p>{labels.heroCopy}</p>
            </div>

            <div className="commerce-hero__principles" aria-label={labels.principlesLabel}>
              <div>
                <RefreshCw size={18} aria-hidden="true" />
                <span><strong>{labels.liveData}</strong><small>{labels.liveDataCopy}</small></span>
              </div>
              <div>
                <PackageSearch size={18} aria-hidden="true" />
                <span><strong>{labels.structured}</strong><small>{labels.structuredCopy}</small></span>
              </div>
              <div>
                <ShieldCheck size={18} aria-hidden="true" />
                <span><strong>{labels.protected}</strong><small>{labels.protectedCopy}</small></span>
              </div>
            </div>
          </section>

          <section className="commerce-catalog" id="catalog" aria-labelledby="catalog-title">
            <div className="commerce-catalog__heading">
              <div><p className="commerce-eyebrow">{labels.catalog}</p><h2 id="catalog-title">{labels.catalogTitle}</h2></div>
              <p>{labels.catalogCopy}</p>
            </div>

            <form className="commerce-search" action="/shop#catalog" method="get">
              <Search size={18} aria-hidden="true" />
              <input type="search" name="q" defaultValue={query} minLength={2} maxLength={100} placeholder={labels.searchPlaceholder} aria-label={labels.searchLabel} />
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <button type="submit">{labels.searchButton}</button>
            </form>

            <div className="commerce-catalog-layout">
              <aside className="commerce-category-nav" id="categories" aria-labelledby="categories-title">
                <div className="commerce-category-nav__heading"><p id="categories-title">{labels.categories}</p><span>{categories.length}</span></div>
                <nav aria-label={labels.categoryNav}>
                  <Link href={pageHref({ page: 1, query }) + '#catalog'} className={!category ? 'is-active' : undefined}>
                    <span>{labels.allProducts}</span><small>{catalog.pagination.total}</small>
                  </Link>
                  {categories.map((item) => (
                    <Link key={item.id} href={pageHref({ page: 1, query, category: item.slug }) + '#catalog'} className={category === item.slug ? 'is-active' : undefined}>
                      <span>{item.name}</span><ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  ))}
                </nav>
              </aside>

              <div className="commerce-catalog-results">
                <div className="commerce-results-meta" aria-live="polite">
                  <p><strong>{catalog.pagination.total}</strong> {labels.products}{query ? ` ${labels.forQuery} “${query}”` : ''}</p>
                  {category ? <Link href={pageHref({ page: 1, query }) + '#catalog'}>{labels.clearFilter}</Link> : null}
                </div>

                {catalog.data.length > 0 ? (
                  <section className="commerce-product-grid" aria-label={labels.productList}>
                    {catalog.data.map((product) => {
                      const variant = product.variants[0];
                      const image = product.images[0];
                      if (!variant) return null;

                      return (
                        <article className="commerce-product-card" key={product.id}>
                          <Link className="commerce-product-card__media" href={`/shop/${encodeURIComponent(product.slug)}`} aria-label={`${labels.view} ${product.name}`}>
                            {image ? <img src={image.url} alt={image.altText} loading="lazy" /> : <span className="commerce-product-card__no-image">{labels.imageMissing}</span>}
                            {variant.availableQuantity < 1 ? <span className="commerce-badge commerce-badge--sold">{labels.soldOut}</span> : null}
                          </Link>
                          <div className="commerce-product-card__body">
                            <p className="commerce-product-card__category">{product.category?.name ?? 'DLavie'}</p>
                            <h2><Link href={`/shop/${encodeURIComponent(product.slug)}`}>{product.name}</Link></h2>
                            <p className="commerce-product-card__description">{product.description}</p>
                            <div className="commerce-product-card__footer">
                              <div><small>{labels.startingFrom}</small><strong>{formatIdr(variant.priceAmount)}</strong></div>
                              <Link className="commerce-product-card__link" href={`/shop/${encodeURIComponent(product.slug)}`}>
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
                    <h2>{labels.emptyTitle}</h2><p>{labels.emptyCopy}</p>
                    <Link className="commerce-button commerce-button--secondary" href="/shop">{labels.fullCatalog}</Link>
                  </section>
                )}

                {totalPages > 1 ? (
                  <nav className="commerce-pagination" aria-label={labels.pagination}>
                    {page > 1 ? <Link href={pageHref({ page: page - 1, query, category }) + '#catalog'}>{labels.previous}</Link> : <span aria-disabled="true">{labels.previous}</span>}
                    <strong>{labels.page} {page} {labels.of} {totalPages}</strong>
                    {page < totalPages ? <Link href={pageHref({ page: page + 1, query, category }) + '#catalog'}>{labels.next}</Link> : <span aria-disabled="true">{labels.next}</span>}
                  </nav>
                ) : null}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  } catch (error) {
    const configured = !(error instanceof CommerceConfigurationError);
    const unavailable = error instanceof CommerceApiError && error.status >= 500;

    return (
      <div className="commerce-page">
        <CommerceHeader />
        <main className="commerce-shell">
          <section className="commerce-service-state" role="alert">
            <p className="commerce-eyebrow">{labels.unavailable}</p>
            <h1>{configured ? labels.catalogUnavailable : labels.backendMissing}</h1>
            <p>{unavailable ? labels.invalidResponse : labels.connectDatabase}</p>
            <Link className="commerce-button commerce-button--secondary" href="/">{labels.back}</Link>
          </section>
        </main>
      </div>
    );
  }
}
