'use client';

import { AlertTriangle, ArrowLeft, ImagePlus, PackagePlus, RefreshCw, Save, Warehouse } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  addProductImage,
  adjustInventory,
  AdminClientError,
  createVariant,
  getCategories,
  getProduct,
  patchProduct,
  patchVariant,
} from '../../admin/client';
import type { AdminCategory, AdminProductDetail, AdminVariant, ProductStatus } from '../../admin/types';
import { formatIdr } from '../../commerce/format';

function string(form: FormData, key: string): string {
  return String(form.get(key) ?? '').trim();
}

function integer(form: FormData, key: string): number {
  return Number.parseInt(string(form, key), 10);
}

function optionalInteger(form: FormData, key: string): number | undefined {
  const value = string(form, key);
  return value ? Number.parseInt(value, 10) : undefined;
}

function parseAttributes(value: string): Record<string, string> {
  if (!value.trim()) return {};
  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Atribut harus berupa objek JSON.');
  }
  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(parsed)) {
    if (!key.trim() || typeof item !== 'string') throw new Error('Setiap atribut harus berupa teks.');
    result[key.trim()] = item;
  }
  return result;
}

export function AdminProductEditor({ productId }: { productId: string }) {
  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [detail, categoryRows] = await Promise.all([getProduct(productId), getCategories()]);
      setProduct(detail);
      setCategories(categoryRows);
    } catch (requestError) {
      setError(requestError instanceof AdminClientError ? requestError.message : 'Produk belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveProduct(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!product || busy) return;
    const form = new FormData(event.currentTarget);
    const categoryId = string(form, 'categoryId');
    const seoTitle = string(form, 'seoTitle');
    const seoDescription = string(form, 'seoDescription');
    setBusy('product');
    setError(null);
    setNotice(null);
    try {
      await patchProduct(product.id, {
        name: string(form, 'name'),
        slug: string(form, 'slug'),
        description: string(form, 'description'),
        status: string(form, 'status') as ProductStatus,
        requiresShipping: form.get('requiresShipping') === 'on',
        ...(categoryId ? { categoryId } : {}),
        ...(seoTitle ? { seoTitle } : {}),
        ...(seoDescription ? { seoDescription } : {}),
      });
      setNotice('Perubahan produk tersimpan.');
      await load();
    } catch (requestError) {
      setError(requestError instanceof AdminClientError ? requestError.message : 'Produk belum dapat disimpan.');
    } finally {
      setBusy(null);
    }
  }

  async function addVariant(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!product || busy) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy('variant-new');
    setError(null);
    setNotice(null);
    try {
      await createVariant(product.id, {
        sku: string(form, 'sku'),
        name: string(form, 'name'),
        priceAmount: integer(form, 'priceAmount'),
        ...(optionalInteger(form, 'compareAtAmount') !== undefined
          ? { compareAtAmount: optionalInteger(form, 'compareAtAmount') }
          : {}),
        ...(optionalInteger(form, 'costAmount') !== undefined
          ? { costAmount: optionalInteger(form, 'costAmount') }
          : {}),
        weightGrams: integer(form, 'weightGrams'),
        attributes: parseAttributes(string(form, 'attributes')),
        isActive: form.get('isActive') === 'on',
      });
      formElement.reset();
      setNotice('Varian dan record inventori berhasil dibuat.');
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Varian belum dapat dibuat.');
    } finally {
      setBusy(null);
    }
  }

  async function toggleVariant(variant: AdminVariant): Promise<void> {
    setBusy(`variant-${variant.id}`);
    setError(null);
    try {
      await patchVariant(variant.id, { isActive: !variant.isActive });
      await load();
    } catch (requestError) {
      setError(requestError instanceof AdminClientError ? requestError.message : 'Status varian belum dapat diubah.');
    } finally {
      setBusy(null);
    }
  }

  async function stockAdjustment(event: FormEvent<HTMLFormElement>, variantId: string): Promise<void> {
    event.preventDefault();
    if (busy) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(`stock-${variantId}`);
    setError(null);
    setNotice(null);
    try {
      await adjustInventory(variantId, integer(form, 'delta'), string(form, 'reason'));
      formElement.reset();
      setNotice('Pergerakan stok tercatat dalam audit inventori.');
      await load();
    } catch (requestError) {
      setError(requestError instanceof AdminClientError ? requestError.message : 'Stok belum dapat disesuaikan.');
    } finally {
      setBusy(null);
    }
  }

  async function addImage(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!product || busy) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy('image');
    setError(null);
    setNotice(null);
    try {
      await addProductImage(product.id, {
        url: string(form, 'url'),
        altText: string(form, 'altText'),
        sortOrder: integer(form, 'sortOrder'),
        isPrimary: form.get('isPrimary') === 'on',
      });
      formElement.reset();
      setNotice('Gambar produk ditambahkan.');
      await load();
    } catch (requestError) {
      setError(requestError instanceof AdminClientError ? requestError.message : 'Gambar belum dapat ditambahkan.');
    } finally {
      setBusy(null);
    }
  }

  if (loading && !product) {
    return <main className="admin-auth-state"><span className="admin-loader" /><p>Memuat detail produk…</p></main>;
  }
  if (!product) {
    return <main className="admin-page"><p className="admin-alert admin-alert--error"><AlertTriangle size={17} />{error ?? 'Produk tidak ditemukan.'}</p><Link className="admin-button admin-button--secondary" href="/admin/products">Kembali</Link></main>;
  }

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <Link className="admin-back-link" href="/admin/products"><ArrowLeft size={16} /> Semua produk</Link>
          <p className="admin-eyebrow">{product.slug}</p>
          <h1>{product.name}</h1>
          <p>{product.variants.length} varian · {product.images.length} gambar · status {product.status}</p>
        </div>
        <button className="admin-button admin-button--secondary" type="button" onClick={load} disabled={loading}><RefreshCw className={loading ? 'admin-spin' : undefined} size={16} /> Perbarui</button>
      </header>

      {error ? <p className="admin-alert admin-alert--error" role="alert"><AlertTriangle size={17} />{error}</p> : null}
      {notice ? <p className="admin-alert admin-alert--success" role="status">{notice}</p> : null}

      <section className="admin-panel">
        <div className="admin-panel__heading"><div><p className="admin-eyebrow">Informasi utama</p><h2>Edit produk</h2></div></div>
        <form className="admin-form admin-form--grid" onSubmit={saveProduct}>
          <label><span>Nama</span><input name="name" defaultValue={product.name} minLength={2} maxLength={180} required /></label>
          <label><span>Slug</span><input name="slug" defaultValue={product.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={200} required /></label>
          <label><span>Status</span><select name="status" defaultValue={product.status}><option value="draft">Draft</option><option value="active">Aktif</option><option value="archived">Arsip</option></select></label>
          <label><span>Kategori</span><select name="categoryId" defaultValue={product.categoryId ?? ''}><option value="">Tanpa kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="admin-checkbox"><input name="requiresShipping" type="checkbox" defaultChecked={product.requiresShipping} /><span>Memerlukan pengiriman</span></label>
          <label className="admin-form__wide"><span>Deskripsi</span><textarea name="description" defaultValue={product.description} rows={7} maxLength={20000} required /></label>
          <label><span>SEO title</span><input name="seoTitle" defaultValue={product.seoTitle ?? ''} maxLength={70} /></label>
          <label><span>SEO description</span><input name="seoDescription" defaultValue={product.seoDescription ?? ''} maxLength={170} /></label>
          <div className="admin-form-actions admin-form__wide"><button className="admin-button admin-button--primary" type="submit" disabled={Boolean(busy)}><Save size={16} /> {busy === 'product' ? 'Menyimpan…' : 'Simpan produk'}</button></div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__heading"><div><p className="admin-eyebrow">SKU</p><h2>Varian & inventori</h2></div></div>
        <div className="admin-variant-list">
          {product.variants.map((variant) => (
            <article className="admin-variant" key={variant.id}>
              <div className="admin-variant__heading"><div><span className={`admin-badge ${variant.isActive ? 'admin-badge--active' : 'admin-badge--archived'}`}>{variant.isActive ? 'aktif' : 'nonaktif'}</span><h3>{variant.name}</h3><p>SKU {variant.sku}</p></div><div><strong>{formatIdr(variant.priceAmount)}</strong><button className="admin-text-button" type="button" onClick={() => toggleVariant(variant)} disabled={Boolean(busy)}>{variant.isActive ? 'Nonaktifkan' : 'Aktifkan'}</button></div></div>
              <dl className="admin-variant__stock"><div><dt>On hand</dt><dd>{variant.onHand}</dd></div><div><dt>Reserved</dt><dd>{variant.reserved}</dd></div><div><dt>Tersedia</dt><dd>{variant.availableQuantity}</dd></div><div><dt>Batas rendah</dt><dd>{variant.lowStockThreshold}</dd></div></dl>
              {Object.keys(variant.attributes).length > 0 ? <p className="admin-variant__attributes">{Object.entries(variant.attributes).map(([key, value]) => `${key}: ${value}`).join(' · ')}</p> : null}
              <form className="admin-inline-form" onSubmit={(event) => stockAdjustment(event, variant.id)}>
                <Warehouse size={17} aria-hidden="true" /><label><span>Perubahan stok</span><input name="delta" type="number" min={-1000000} max={1000000} step={1} required /></label><label className="admin-inline-form__grow"><span>Alasan audit</span><input name="reason" minLength={3} maxLength={500} required /></label><button className="admin-button admin-button--secondary" type="submit" disabled={Boolean(busy)}>Catat</button>
              </form>
            </article>
          ))}
          {product.variants.length === 0 ? <p className="admin-empty-inline">Belum ada varian. Produk tidak dapat diaktifkan.</p> : null}
        </div>
        <details className="admin-disclosure"><summary><PackagePlus size={17} /> Tambah varian</summary><form className="admin-form admin-form--grid" onSubmit={addVariant}>
          <label><span>SKU</span><input name="sku" pattern="[A-Za-z0-9][A-Za-z0-9._-]{1,63}" maxLength={64} required /></label><label><span>Nama varian</span><input name="name" maxLength={120} required /></label><label><span>Harga IDR</span><input name="priceAmount" type="number" min={0} max={2000000000} step={1} required /></label><label><span>Harga pembanding</span><input name="compareAtAmount" type="number" min={0} max={2000000000} step={1} /></label><label><span>Modal</span><input name="costAmount" type="number" min={0} max={2000000000} step={1} /></label><label><span>Berat gram</span><input name="weightGrams" type="number" min={0} max={1000000} step={1} defaultValue={0} required /></label><label className="admin-form__wide"><span>Atribut JSON</span><textarea name="attributes" rows={3} placeholder={'{"Ukuran":"M","Warna":"Hitam"}'} /></label><label className="admin-checkbox"><input name="isActive" type="checkbox" defaultChecked /><span>Varian aktif</span></label><div className="admin-form-actions admin-form__wide"><button className="admin-button admin-button--primary" type="submit" disabled={Boolean(busy)}>Buat varian</button></div>
        </form></details>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__heading"><div><p className="admin-eyebrow">Media</p><h2>Gambar produk</h2></div></div>
        <div className="admin-image-grid">{product.images.map((image) => <figure key={image.id}><img src={image.url} alt={image.altText} /><figcaption>{image.altText}{image.isPrimary ? <span className="admin-badge admin-badge--active">utama</span> : null}</figcaption></figure>)}{product.images.length === 0 ? <p className="admin-empty-inline">Belum ada gambar. Produk tidak dapat diaktifkan.</p> : null}</div>
        <details className="admin-disclosure"><summary><ImagePlus size={17} /> Tambah gambar HTTPS</summary><form className="admin-form admin-form--grid" onSubmit={addImage}><label className="admin-form__wide"><span>URL gambar</span><input name="url" type="url" placeholder="https://cdn.domain.com/produk.webp" required /></label><label><span>Alt text</span><input name="altText" minLength={1} maxLength={250} required /></label><label><span>Urutan</span><input name="sortOrder" type="number" min={0} max={10000} step={1} defaultValue={0} required /></label><label className="admin-checkbox"><input name="isPrimary" type="checkbox" /><span>Jadikan gambar utama</span></label><div className="admin-form-actions admin-form__wide"><button className="admin-button admin-button--primary" type="submit" disabled={Boolean(busy)}>Tambah gambar</button></div></form></details>
      </section>
    </main>
  );
}
