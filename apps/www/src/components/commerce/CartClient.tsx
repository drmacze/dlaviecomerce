'use client';

import { Minus, Plus, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CommerceClientError, getCart, removeCartItem, setCartItem } from '../../commerce/client';
import { formatIdr } from '../../commerce/format';
import { clearCartSession, readCartSession } from '../../commerce/storage';
import type { CartSession, CartView } from '../../commerce/types';

export function CartClient() {
  const [session, setSession] = useState<CartSession | null>(null);
  const [cart, setCart] = useState<CartView | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [pendingVariant, setPendingVariant] = useState<string | null>(null);

  const load = useCallback(async () => {
    const currentSession = readCartSession();
    if (!currentSession) {
      setSession(null);
      setCart(null);
      setStatus('empty');
      return;
    }

    setSession(currentSession);
    setStatus('loading');
    setError(null);
    try {
      const currentCart = await getCart(currentSession);
      setCart(currentCart);
      setStatus(currentCart.items.length > 0 ? 'ready' : 'empty');
    } catch (requestError) {
      if (requestError instanceof CommerceClientError && requestError.status === 401) {
        clearCartSession();
        setSession(null);
        setCart(null);
        setStatus('empty');
        return;
      }
      setStatus('error');
      setError(
        requestError instanceof CommerceClientError
          ? requestError.message
          : 'Keranjang belum dapat dimuat.',
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateQuantity(variantId: string, quantity: number): Promise<void> {
    if (!session || quantity < 1 || quantity > 99) return;
    setPendingVariant(variantId);
    setError(null);
    try {
      const updated = await setCartItem(session, variantId, quantity);
      setCart(updated);
      setStatus(updated.items.length > 0 ? 'ready' : 'empty');
    } catch (requestError) {
      setError(
        requestError instanceof CommerceClientError
          ? requestError.message
          : 'Jumlah produk belum dapat diperbarui.',
      );
    } finally {
      setPendingVariant(null);
    }
  }

  async function remove(variantId: string): Promise<void> {
    if (!session) return;
    setPendingVariant(variantId);
    setError(null);
    try {
      const updated = await removeCartItem(session, variantId);
      setCart(updated);
      setStatus(updated.items.length > 0 ? 'ready' : 'empty');
    } catch (requestError) {
      setError(
        requestError instanceof CommerceClientError
          ? requestError.message
          : 'Produk belum dapat dihapus dari keranjang.',
      );
    } finally {
      setPendingVariant(null);
    }
  }

  if (status === 'loading') {
    return (
      <section className="commerce-loading" aria-live="polite">
        <RefreshCw className="commerce-spin" size={24} aria-hidden="true" />
        <p>Memuat keranjang…</p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="commerce-service-state" role="alert">
        <p className="commerce-eyebrow">Keranjang tidak tersedia</p>
        <h1>Data keranjang belum dapat dibaca</h1>
        <p>{error}</p>
        <button className="commerce-button commerce-button--secondary" type="button" onClick={load}>
          Coba lagi
        </button>
      </section>
    );
  }

  if (status === 'empty' || !cart || cart.items.length === 0) {
    return (
      <section className="commerce-empty commerce-empty--large">
        <p className="commerce-eyebrow">Keranjang</p>
        <h1>Keranjang masih kosong</h1>
        <p>Pilih produk aktif dari katalog. Tidak ada item contoh yang ditambahkan otomatis.</p>
        <Link className="commerce-button commerce-button--primary" href="/shop">
          Lihat katalog
        </Link>
      </section>
    );
  }

  const canCheckout = cart.items.every((item) => item.purchasable);

  return (
    <div className="commerce-cart-layout">
      <section className="commerce-cart-list" aria-labelledby="cart-heading">
        <div className="commerce-section-heading">
          <div>
            <p className="commerce-eyebrow">Keranjang aktif</p>
            <h1 id="cart-heading">Periksa pesanan</h1>
          </div>
          <span>{cart.items.length} jenis produk</span>
        </div>

        {error ? (
          <p className="commerce-form-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="commerce-cart-items">
          {cart.items.map((item) => {
            const busy = pendingVariant === item.variantId;
            return (
              <article className="commerce-cart-item" key={item.variantId}>
                <Link
                  className="commerce-cart-item__media"
                  href={`/shop/${encodeURIComponent(item.product.slug)}`}
                  aria-label={`Buka ${item.product.name}`}
                >
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt="" />
                  ) : (
                    <span>Tanpa gambar</span>
                  )}
                </Link>

                <div className="commerce-cart-item__content">
                  <div className="commerce-cart-item__heading">
                    <div>
                      <p>SKU {item.sku}</p>
                      <h2>
                        <Link href={`/shop/${encodeURIComponent(item.product.slug)}`}>
                          {item.product.name}
                        </Link>
                      </h2>
                      <span>{item.variantName}</span>
                    </div>
                    <strong>{formatIdr(item.lineTotalAmount)}</strong>
                  </div>

                  {Object.keys(item.attributes).length > 0 ? (
                    <dl className="commerce-cart-item__attributes">
                      {Object.entries(item.attributes).map(([key, value]) => (
                        <div key={key}>
                          <dt>{key}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  {!item.purchasable ? (
                    <p className="commerce-stock commerce-stock--empty" role="alert">
                      Jumlah ini tidak lagi tersedia. Maksimum saat ini: {item.availableQuantity}.
                    </p>
                  ) : (
                    <p className="commerce-stock">{item.availableQuantity} stok tersedia</p>
                  )}

                  <div className="commerce-cart-item__actions">
                    <div className="commerce-quantity" aria-label={`Jumlah ${item.product.name}`}>
                      <button
                        type="button"
                        aria-label="Kurangi jumlah"
                        disabled={busy || item.quantity <= 1}
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      >
                        <Minus size={15} aria-hidden="true" />
                      </button>
                      <output>{item.quantity}</output>
                      <button
                        type="button"
                        aria-label="Tambah jumlah"
                        disabled={busy || item.quantity >= Math.min(item.availableQuantity, 99)}
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      >
                        <Plus size={15} aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      className="commerce-text-button commerce-text-button--danger"
                      type="button"
                      disabled={busy}
                      onClick={() => remove(item.variantId)}
                    >
                      <Trash2 size={15} aria-hidden="true" /> Hapus
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="commerce-order-summary" aria-labelledby="summary-heading">
        <p className="commerce-eyebrow">Ringkasan</p>
        <h2 id="summary-heading">Total keranjang</h2>
        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatIdr(cart.subtotalAmount)}</dd>
          </div>
          <div>
            <dt>Pengiriman</dt>
            <dd>Dihitung saat checkout</dd>
          </div>
          <div className="commerce-order-summary__total">
            <dt>Total sementara</dt>
            <dd>{formatIdr(cart.subtotalAmount)}</dd>
          </div>
        </dl>
        {canCheckout ? (
          <Link
            className="commerce-button commerce-button--primary commerce-button--wide"
            href="/checkout"
          >
            Lanjut ke checkout
          </Link>
        ) : (
          <button
            className="commerce-button commerce-button--primary commerce-button--wide"
            type="button"
            disabled
          >
            Perbarui jumlah terlebih dahulu
          </button>
        )}
        <Link className="commerce-text-link" href="/shop">
          Lanjut berbelanja
        </Link>
      </aside>
    </div>
  );
}
