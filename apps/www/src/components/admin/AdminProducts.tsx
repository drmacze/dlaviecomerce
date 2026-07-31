'use client';

import { AlertTriangle, Box, ImageOff, Plus, RefreshCw, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { AdminClientError, createProduct, getCategories, getProducts } from '../../admin/client';
import type { AdminCategory, AdminProductListItem, ProductStatus } from '../../admin/types';

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

export function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [result, categoryRows] = await Promise.all([
        getProducts({
          page,
          limit: 24,
          ...(status ? { status } : {}),
          ...(search.trim() ? { search: search.trim() } : {}),
        }),
        getCategories(),
      ]);
      setProducts(result.data);
      setTotal(result.pagination.total ?? result.data.length);
      setCategories(categoryRows);
    } catch (requestError) {
      setError(
        requestError instanceof AdminClientError
          ? requestError.message
          : 'Produk belum dapat dimuat.',
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function submitCreate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (creating) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const providedSlug = String(form.get('slug') ?? '').trim();
    const description = String(form.get('description') ?? '').trim();
    const categoryId = String(form.get('categoryId') ?? '').trim();
    const seoTitle = String(form.get('seoTitle') ?? '').trim();
    const seoDescription = String(form.get('seoDescription') ?? '').trim();
    const requiresShipping = form.get('requiresShipping') === 'on';

    setCreating(true);
    setError(null);
    try {
      const product = await createProduct({
        name,
        slug: providedSlug || slugify(name),
        description,
        requiresShipping,
        ...(categoryId ? { categoryId } : {}),
        ...(seoTitle ? { seoTitle } : {}),
        ...(seoDescription ? { seoDescription } : {}),
      });
      router.push(`/admin/products/${encodeURIComponent(product.id)}`);
    } catch (requestError) {
      setError(
        requestError instanceof AdminClientError
          ? requestError.message
          : 'Produk belum dapat dibuat.',
      );
      setCreating(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / 24));

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Catalog</p>
          <h1>Produk & stok</h1>
          <p>
            Produk baru selalu dibuat sebagai draft sampai memiliki varian aktif dan gambar nyata.
          </p>
        </div>
        <button
          className="admin-button admin-button--primary"
          type="button"
          onClick={() => setShowCreate((value) => !value)}
        >
          <Plus size={16} aria-hidden="true" /> Produk baru
        </button>
      </header>

      {error ? (
        <p className="admin-alert admin-alert--error" role="alert">
          <AlertTriangle size={17} aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {showCreate ? (
        <section className="admin-panel admin-create-panel">
          <div className="admin-panel__heading">
            <div>
              <p className="admin-eyebrow">Draft baru</p>
              <h2>Buat produk</h2>
            </div>
          </div>
          <form className="admin-form admin-form--grid" onSubmit={submitCreate}>
            <label>
              <span>Nama produk</span>
              <input name="name" minLength={2} maxLength={180} required />
            </label>
            <label>
              <span>Slug (opsional)</span>
              <input
                name="slug"
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                maxLength={200}
                placeholder="dibuat dari nama bila kosong"
              />
            </label>
            <label>
              <span>Kategori</span>
              <select name="categoryId" defaultValue="">
                <option value="">Tanpa kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-checkbox">
              <input name="requiresShipping" type="checkbox" />
              <span>Produk fisik memerlukan pengiriman</span>
            </label>
            <label className="admin-form__wide">
              <span>Deskripsi</span>
              <textarea name="description" minLength={1} maxLength={20000} rows={5} required />
            </label>
            <label>
              <span>SEO title (opsional)</span>
              <input name="seoTitle" maxLength={70} />
            </label>
            <label>
              <span>SEO description (opsional)</span>
              <input name="seoDescription" maxLength={170} />
            </label>
            <div className="admin-form-actions admin-form__wide">
              <button
                className="admin-button admin-button--primary"
                type="submit"
                disabled={creating}
              >
                {creating ? 'Membuat…' : 'Buat draft produk'}
              </button>
              <button
                className="admin-button admin-button--ghost"
                type="button"
                onClick={() => setShowCreate(false)}
              >
                Batal
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="admin-toolbar" aria-label="Filter produk">
        <label className="admin-search">
          <Search size={16} aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Cari nama atau slug"
          />
        </label>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ProductStatus | '');
            setPage(1);
          }}
          aria-label="Status produk"
        >
          <option value="">Semua status</option>
          <option value="draft">Draft</option>
          <option value="active">Aktif</option>
          <option value="archived">Arsip</option>
        </select>
        <button
          className="admin-icon-button"
          type="button"
          onClick={load}
          aria-label="Perbarui produk"
        >
          <RefreshCw className={loading ? 'admin-spin' : undefined} size={17} />
        </button>
      </section>

      {loading && products.length === 0 ? (
        <section className="admin-loading">
          <span className="admin-loader" />
          <p>Memuat produk…</p>
        </section>
      ) : null}
      {!loading && products.length === 0 ? (
        <section className="admin-empty">
          <Box size={30} />
          <h2>Belum ada produk</h2>
          <p>Buat produk pertama menggunakan data produk yang benar.</p>
        </section>
      ) : null}

      <section className="admin-product-grid">
        {products.map((product) => (
          <button
            key={product.id}
            className="admin-product-card"
            type="button"
            onClick={() => router.push(`/admin/products/${encodeURIComponent(product.id)}`)}
          >
            <div className="admin-product-card__image">
              {product.primaryImageUrl ? (
                <img src={product.primaryImageUrl} alt="" />
              ) : (
                <ImageOff size={25} aria-label="Belum ada gambar" />
              )}
            </div>
            <div className="admin-product-card__body">
              <div>
                <span className={`admin-badge admin-badge--${product.status}`}>
                  {product.status}
                </span>
                {product.lowStockVariantCount > 0 ? (
                  <span className="admin-badge admin-badge--warning">
                    {product.lowStockVariantCount} stok menipis
                  </span>
                ) : null}
              </div>
              <h2>{product.name}</h2>
              <p>
                {product.categoryName ?? 'Tanpa kategori'} · {product.variantCount} varian
              </p>
              <dl>
                <div>
                  <dt>Stok tersedia</dt>
                  <dd>{product.availableQuantity}</dd>
                </div>
                <div>
                  <dt>Varian aktif</dt>
                  <dd>{product.activeVariantCount}</dd>
                </div>
              </dl>
            </div>
          </button>
        ))}
      </section>

      {totalPages > 1 ? (
        <nav className="admin-pagination" aria-label="Pagination produk">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Sebelumnya
          </button>
          <span>
            Halaman {page} dari {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Berikutnya
          </button>
        </nav>
      ) : null}
    </main>
  );
}
