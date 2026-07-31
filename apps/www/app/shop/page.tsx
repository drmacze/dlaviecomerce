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

export const metadata: Metadata = {
  title: 'DLavie Commerce — Katalog Produk',
  description: 'Temukan produk aktif DLavie dengan harga dan ketersediaan stok terkini.',
};

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
  const resolved = await searchParams;
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
              <p className="commerce-eyebrow">Koleksi DLavie</p>
              <h1 id="commerce-title">Belanja lebih mudah, tanpa distraksi.</h1>
              <p>
                Temukan produk DLavie melalui katalog yang jelas, harga transparan, dan informasi
                stok yang diperbarui langsung dari sistem commerce.
              </p>
            </div>

            <div className="commerce-hero__principles" aria-label="Keunggulan layanan commerce">
              <div>
                <RefreshCw size={18} aria-hidden="true" />
                <span>
                  <strong>Data langsung</strong>
                  <small>Harga dan stok dibaca dari sistem.</small>
                </span>
              </div>
              <div>
                <PackageSearch size={18} aria-hidden="true" />
                <span>
                  <strong>Katalog terstruktur</strong>
                  <small>Cari dan pilih kategori dengan cepat.</small>
                </span>
              </div>
              <div>
                <ShieldCheck size={18} aria-hidden="true" />
                <span>
                  <strong>Checkout terlindungi</strong>
                  <small>Data transaksi diproses melalui server.</small>
                </span>
              </div>
            </div>
          </section>

          <section className="commerce-catalog" id="catalog" aria-labelledby="catalog-title">
            <div className="commerce-catalog__heading">
              <div>
                <p className="commerce-eyebrow">Katalog</p>
                <h2 id="catalog-title">Temukan produk yang tepat</h2>
              </div>
              <p>Cari berdasarkan nama atau jelajahi kategori yang tersedia.</p>
            </div>

            <form className="commerce-search" action="/shop#catalog" method="get">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                minLength={2}
                maxLength={100}
                placeholder="Cari nama produk"
                aria-label="Cari produk"
              />
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <button type="submit">Cari produk</button>
            </form>

            <div className="commerce-catalog-layout">
              <aside className="commerce-category-nav" id="categories" aria-labelledby="categories-title">
                <div className="commerce-category-nav__heading">
                  <p id="categories-title">Kategori</p>
                  <span>{categories.length}</span>
                </div>
                <nav aria-label="Kategori produk">
                  <Link
                    href={pageHref({ page: 1, query }) + '#catalog'}
                    className={!category ? 'is-active' : undefined}
                  >
                    <span>Semua produk</span>
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
                    <strong>{catalog.pagination.total}</strong> produk
                    {query ? ` untuk “${query}”` : ''}
                  </p>
                  {category ? (
                    <Link href={pageHref({ page: 1, query }) + '#catalog'}>Hapus filter</Link>
                  ) : null}
                </div>

                {catalog.data.length > 0 ? (
                  <section className="commerce-product-grid" aria-label="Daftar produk">
                    {catalog.data.map((product) => {
                      const variant = product.variants[0];
                      const image = product.images[0];
                      if (!variant) return null;

                      return (
                        <article className="commerce-product-card" key={product.id}>
                          <Link
                            className="commerce-product-card__media"
                            href={`/shop/${encodeURIComponent(product.slug)}`}
                            aria-label={`Lihat ${product.name}`}
                          >
                            {image ? (
                              <img src={image.url} alt={image.altText} loading="lazy" />
                            ) : (
                              <span className="commerce-product-card__no-image">
                                Gambar belum tersedia
                              </span>
                            )}
                            {variant.availableQuantity < 1 ? (
                              <span className="commerce-badge commerce-badge--sold">Stok habis</span>
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
                                <small>Mulai dari</small>
                                <strong>{formatIdr(variant.priceAmount)}</strong>
                              </div>
                              <Link
                                className="commerce-product-card__link"
                                href={`/shop/${encodeURIComponent(product.slug)}`}
                              >
                                Lihat produk <ArrowRight size={15} aria-hidden="true" />
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </section>
                ) : (
                  <section className="commerce-empty">
                    <h2>Belum ada produk yang cocok</h2>
                    <p>Ubah kata pencarian atau kategori. Tidak ada produk contoh yang ditampilkan.</p>
                    <Link className="commerce-button commerce-button--secondary" href="/shop">
                      Lihat seluruh katalog
                    </Link>
                  </section>
                )}

                {totalPages > 1 ? (
                  <nav className="commerce-pagination" aria-label="Halaman katalog">
                    {page > 1 ? (
                      <Link href={pageHref({ page: page - 1, query, category }) + '#catalog'}>
                        Sebelumnya
                      </Link>
                    ) : (
                      <span aria-disabled="true">Sebelumnya</span>
                    )}
                    <strong>
                      Halaman {page} dari {totalPages}
                    </strong>
                    {page < totalPages ? (
                      <Link href={pageHref({ page: page + 1, query, category }) + '#catalog'}>
                        Berikutnya
                      </Link>
                    ) : (
                      <span aria-disabled="true">Berikutnya</span>
                    )}
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
            <p className="commerce-eyebrow">Commerce belum tersedia</p>
            <h1>
              {configured ? 'Katalog sedang tidak dapat diakses' : 'Backend belum dikonfigurasi'}
            </h1>
            <p>
              {unavailable
                ? 'Layanan commerce tidak memberikan respons yang valid. Tidak ada data lokal atau produk palsu yang digunakan sebagai pengganti.'
                : 'Hubungkan database commerce sebelum membuka toko.'}
            </p>
            <Link className="commerce-button commerce-button--secondary" href="/">
              Kembali ke DLavie
            </Link>
          </section>
        </main>
      </div>
    );
  }
}
