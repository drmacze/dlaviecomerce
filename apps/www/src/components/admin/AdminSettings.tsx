'use client';

import { AlertTriangle, Plus, RefreshCw, Save } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  AdminClientError,
  createCategory,
  createShippingMethod,
  getCategories,
  getShippingMethods,
  patchCategory,
  patchShippingMethod,
} from '../../admin/client';
import type { AdminCategory, AdminShippingMethod } from '../../admin/types';
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

export function AdminSettings() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [shipping, setShipping] = useState<AdminShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoryRows, shippingRows] = await Promise.all([
        getCategories(),
        getShippingMethods(),
      ]);
      setCategories(categoryRows);
      setShipping(shippingRows);
    } catch (requestError) {
      setError(
        requestError instanceof AdminClientError
          ? requestError.message
          : 'Pengaturan katalog belum dapat dimuat.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addCategory(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy('category-new');
    setError(null);
    setNotice(null);
    try {
      await createCategory({
        name: string(form, 'name'),
        slug: string(form, 'slug'),
        ...(string(form, 'description') ? { description: string(form, 'description') } : {}),
        isActive: form.get('isActive') === 'on',
        sortOrder: integer(form, 'sortOrder'),
      });
      formElement.reset();
      setNotice('Kategori berhasil dibuat.');
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof AdminClientError
          ? requestError.message
          : 'Kategori belum dapat dibuat.',
      );
    } finally {
      setBusy(null);
    }
  }

  async function toggleCategory(category: AdminCategory): Promise<void> {
    setBusy(category.id);
    setError(null);
    try {
      await patchCategory(category.id, { isActive: !category.isActive });
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof AdminClientError
          ? requestError.message
          : 'Kategori belum dapat diperbarui.',
      );
    } finally {
      setBusy(null);
    }
  }

  async function addShipping(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy('shipping-new');
    setError(null);
    setNotice(null);
    try {
      const freeAboveAmount = optionalInteger(form, 'freeAboveAmount');
      await createShippingMethod({
        code: string(form, 'code'),
        name: string(form, 'name'),
        flatRateAmount: integer(form, 'flatRateAmount'),
        ...(freeAboveAmount !== undefined ? { freeAboveAmount } : {}),
        isActive: form.get('isActive') === 'on',
      });
      formElement.reset();
      setNotice('Metode pengiriman berhasil dibuat.');
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof AdminClientError
          ? requestError.message
          : 'Metode pengiriman belum dapat dibuat.',
      );
    } finally {
      setBusy(null);
    }
  }

  async function toggleShipping(method: AdminShippingMethod): Promise<void> {
    setBusy(method.id);
    setError(null);
    try {
      await patchShippingMethod(method.id, { isActive: !method.isActive });
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof AdminClientError
          ? requestError.message
          : 'Metode pengiriman belum dapat diperbarui.',
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Configuration</p>
          <h1>Katalog & pengiriman</h1>
          <p>Hanya record aktif yang akan terlihat oleh pelanggan.</p>
        </div>
        <button
          className="admin-button admin-button--secondary"
          type="button"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw className={loading ? 'admin-spin' : undefined} size={16} /> Perbarui
        </button>
      </header>

      {error ? (
        <p className="admin-alert admin-alert--error" role="alert">
          <AlertTriangle size={17} /> {error}
        </p>
      ) : null}
      {notice ? (
        <p className="admin-alert admin-alert--success" role="status">
          {notice}
        </p>
      ) : null}

      <div className="admin-panel-grid">
        <section className="admin-panel">
          <div className="admin-panel__heading">
            <div>
              <p className="admin-eyebrow">Taxonomy</p>
              <h2>Kategori</h2>
            </div>
            <span>{categories.length} record</span>
          </div>
          <div className="admin-setting-list">
            {categories.map((category) => (
              <article key={category.id}>
                <div>
                  <span
                    className={`admin-badge ${
                      category.isActive ? 'admin-badge--active' : 'admin-badge--archived'
                    }`}
                  >
                    {category.isActive ? 'aktif' : 'nonaktif'}
                  </span>
                  <h3>{category.name}</h3>
                  <p>/{category.slug} · urutan {category.sortOrder}</p>
                </div>
                <button
                  className="admin-text-button"
                  type="button"
                  onClick={() => toggleCategory(category)}
                  disabled={Boolean(busy)}
                >
                  {category.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </article>
            ))}
            {categories.length === 0 ? (
              <p className="admin-empty-inline">Belum ada kategori.</p>
            ) : null}
          </div>
          <details className="admin-disclosure">
            <summary>
              <Plus size={17} /> Tambah kategori
            </summary>
            <form className="admin-form" onSubmit={addCategory}>
              <label>
                <span>Nama</span>
                <input name="name" minLength={2} maxLength={100} required />
              </label>
              <label>
                <span>Slug</span>
                <input
                  name="slug"
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  maxLength={120}
                  required
                />
              </label>
              <label>
                <span>Deskripsi</span>
                <textarea name="description" maxLength={1000} rows={3} />
              </label>
              <label>
                <span>Urutan</span>
                <input
                  name="sortOrder"
                  type="number"
                  min={0}
                  max={100000}
                  defaultValue={0}
                  required
                />
              </label>
              <label className="admin-checkbox">
                <input name="isActive" type="checkbox" defaultChecked />
                <span>Aktif</span>
              </label>
              <button
                className="admin-button admin-button--primary"
                type="submit"
                disabled={Boolean(busy)}
              >
                <Save size={16} /> Simpan kategori
              </button>
            </form>
          </details>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__heading">
            <div>
              <p className="admin-eyebrow">Fulfillment</p>
              <h2>Metode pengiriman</h2>
            </div>
            <span>{shipping.length} record</span>
          </div>
          <div className="admin-setting-list">
            {shipping.map((method) => (
              <article key={method.id}>
                <div>
                  <span
                    className={`admin-badge ${
                      method.isActive ? 'admin-badge--active' : 'admin-badge--archived'
                    }`}
                  >
                    {method.isActive ? 'aktif' : 'nonaktif'}
                  </span>
                  <h3>{method.name}</h3>
                  <p>
                    {method.code} · {formatIdr(method.flatRateAmount)}
                    {method.freeAboveAmount !== null
                      ? ` · gratis ≥ ${formatIdr(method.freeAboveAmount)}`
                      : ''}
                  </p>
                </div>
                <button
                  className="admin-text-button"
                  type="button"
                  onClick={() => toggleShipping(method)}
                  disabled={Boolean(busy)}
                >
                  {method.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </article>
            ))}
            {shipping.length === 0 ? (
              <p className="admin-empty-inline">Belum ada metode pengiriman.</p>
            ) : null}
          </div>
          <details className="admin-disclosure">
            <summary>
              <Plus size={17} /> Tambah metode
            </summary>
            <form className="admin-form" onSubmit={addShipping}>
              <label>
                <span>Kode</span>
                <input
                  name="code"
                  pattern="[A-Za-z0-9][A-Za-z0-9_-]{1,31}"
                  maxLength={32}
                  required
                />
              </label>
              <label>
                <span>Nama</span>
                <input name="name" minLength={2} maxLength={100} required />
              </label>
              <label>
                <span>Tarif IDR</span>
                <input
                  name="flatRateAmount"
                  type="number"
                  min={0}
                  max={2000000000}
                  step={1}
                  required
                />
              </label>
              <label>
                <span>Gratis mulai IDR (opsional)</span>
                <input
                  name="freeAboveAmount"
                  type="number"
                  min={0}
                  max={2000000000}
                  step={1}
                />
              </label>
              <label className="admin-checkbox">
                <input name="isActive" type="checkbox" defaultChecked />
                <span>Aktif</span>
              </label>
              <button
                className="admin-button admin-button--primary"
                type="submit"
                disabled={Boolean(busy)}
              >
                <Save size={16} /> Simpan metode
              </button>
            </form>
          </details>
        </section>
      </div>
    </main>
  );
}
