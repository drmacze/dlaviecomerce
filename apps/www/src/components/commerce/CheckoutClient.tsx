'use client';

import { ArrowLeft, LockKeyhole, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  checkout,
  CommerceClientError,
  getCart,
  getShippingMethods,
} from '../../commerce/client';
import { formatIdr } from '../../commerce/format';
import {
  clearCartSession,
  readCartSession,
  writeOrderAccess,
} from '../../commerce/storage';
import type { CartSession, CartView, CheckoutInput, ShippingMethod } from '../../commerce/types';

function createIdempotencyKey(): string {
  return `${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`;
}

function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function CheckoutClient() {
  const [session, setSession] = useState<CartSession | null>(null);
  const [cart, setCart] = useState<CartView | null>(null);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShipping, setSelectedShipping] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'submitting' | 'empty' | 'error'>(
    'loading',
  );
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const currentSession = readCartSession();
    if (!currentSession) {
      setStatus('empty');
      return;
    }

    setSession(currentSession);
    setStatus('loading');
    setError(null);
    try {
      const currentCart = await getCart(currentSession);
      if (currentCart.items.length === 0) {
        setCart(currentCart);
        setStatus('empty');
        return;
      }
      if (currentCart.items.some((item) => !item.purchasable)) {
        setCart(currentCart);
        setStatus('error');
        setError('Keranjang berisi jumlah yang tidak lagi tersedia. Perbarui keranjang dahulu.');
        return;
      }

      const requiresShipping = currentCart.items.some((item) => item.product.requiresShipping);
      const methods = requiresShipping ? await getShippingMethods() : [];
      setCart(currentCart);
      setShippingMethods(methods);
      setSelectedShipping(methods[0]?.id ?? '');
      setStatus('ready');
    } catch (requestError) {
      if (requestError instanceof CommerceClientError && requestError.status === 401) {
        clearCartSession();
        setStatus('empty');
        return;
      }
      setStatus('error');
      setError(
        requestError instanceof CommerceClientError
          ? requestError.message
          : 'Checkout belum dapat dimuat.',
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const requiresShipping = useMemo(
    () => cart?.items.some((item) => item.product.requiresShipping) ?? false,
    [cart],
  );

  const selectedMethod = shippingMethods.find((method) => method.id === selectedShipping) ?? null;
  const shippingAmount = useMemo(() => {
    if (!cart || !selectedMethod) return 0;
    if (
      selectedMethod.freeAboveAmount !== null &&
      cart.subtotalAmount >= selectedMethod.freeAboveAmount
    ) {
      return 0;
    }
    return selectedMethod.flatRateAmount;
  }, [cart, selectedMethod]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!session || !cart || status === 'submitting') return;

    const form = new FormData(event.currentTarget);
    const fullName = text(form, 'fullName');
    const email = text(form, 'email');
    const phone = text(form, 'phone');
    const customerNote = text(form, 'customerNote');

    if (!fullName || !email) {
      setError('Nama lengkap dan email wajib diisi.');
      return;
    }
    if (requiresShipping && (!selectedMethod || !phone)) {
      setError('Metode pengiriman dan nomor telepon wajib diisi untuk produk fisik.');
      return;
    }

    const input: CheckoutInput = {
      fullName,
      email,
      ...(phone ? { phone } : {}),
      ...(customerNote ? { customerNote } : {}),
    };

    if (requiresShipping) {
      const recipientName = text(form, 'recipientName');
      const line1 = text(form, 'line1');
      const line2 = text(form, 'line2');
      const district = text(form, 'district');
      const city = text(form, 'city');
      const province = text(form, 'province');
      const postalCode = text(form, 'postalCode');

      if (!recipientName || !line1 || !district || !city || !province || !postalCode) {
        setError('Lengkapi seluruh alamat pengiriman yang wajib diisi.');
        return;
      }

      input.shippingMethodId = selectedMethod?.id;
      input.shippingAddress = {
        recipientName,
        phone,
        line1,
        ...(line2 ? { line2 } : {}),
        district,
        city,
        province,
        postalCode,
        countryCode: 'ID',
      };
    }

    const idempotencyKey = createIdempotencyKey();
    setStatus('submitting');
    setError(null);
    try {
      const order = await checkout(session, idempotencyKey, input);
      writeOrderAccess(order.orderNumber, idempotencyKey);
      clearCartSession();

      if (order.payment?.checkoutUrl) {
        window.location.assign(order.payment.checkoutUrl);
        return;
      }
      window.location.assign(`/orders/${encodeURIComponent(order.orderNumber)}`);
    } catch (requestError) {
      setStatus('ready');
      setError(
        requestError instanceof CommerceClientError
          ? requestError.message
          : 'Pesanan belum dapat dibuat. Tidak ada pembayaran yang dianggap berhasil.',
      );
    }
  }

  if (status === 'loading') {
    return (
      <section className="commerce-loading" aria-live="polite">
        <RefreshCw className="commerce-spin" size={24} aria-hidden="true" />
        <p>Memeriksa keranjang dan metode pengiriman…</p>
      </section>
    );
  }

  if (status === 'empty') {
    return (
      <section className="commerce-empty commerce-empty--large">
        <p className="commerce-eyebrow">Checkout</p>
        <h1>Tidak ada keranjang aktif</h1>
        <p>Tambahkan produk dari katalog sebelum membuat pesanan.</p>
        <Link className="commerce-button commerce-button--primary" href="/shop">
          Lihat katalog
        </Link>
      </section>
    );
  }

  if (status === 'error' && !cart) {
    return (
      <section className="commerce-service-state" role="alert">
        <p className="commerce-eyebrow">Checkout tidak tersedia</p>
        <h1>Data checkout belum dapat dimuat</h1>
        <p>{error}</p>
        <button className="commerce-button commerce-button--secondary" type="button" onClick={load}>
          Coba lagi
        </button>
      </section>
    );
  }

  if (!cart) return null;

  return (
    <div className="commerce-checkout-layout">
      <form className="commerce-checkout-form" onSubmit={submit}>
        <Link className="commerce-back-link" href="/cart">
          <ArrowLeft size={17} aria-hidden="true" /> Kembali ke keranjang
        </Link>
        <div className="commerce-section-heading">
          <div>
            <p className="commerce-eyebrow">Checkout aman</p>
            <h1>Data pemesan</h1>
          </div>
          <LockKeyhole size={24} aria-hidden="true" />
        </div>

        {error ? (
          <p className="commerce-form-error" role="alert">
            {error}
          </p>
        ) : null}

        <fieldset className="commerce-form-section">
          <legend>Kontak</legend>
          <div className="commerce-form-grid">
            <label>
              <span>Nama lengkap</span>
              <input name="fullName" autoComplete="name" minLength={2} maxLength={120} required />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" maxLength={254} required />
            </label>
            <label>
              <span>Nomor telepon {requiresShipping ? '' : '(opsional)'}</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                minLength={6}
                maxLength={30}
                required={requiresShipping}
              />
            </label>
          </div>
        </fieldset>

        {requiresShipping ? (
          <>
            <fieldset className="commerce-form-section">
              <legend>Metode pengiriman</legend>
              {shippingMethods.length > 0 ? (
                <div className="commerce-shipping-options">
                  {shippingMethods.map((method) => {
                    const free =
                      method.freeAboveAmount !== null &&
                      cart.subtotalAmount >= method.freeAboveAmount;
                    return (
                      <label key={method.id} className="commerce-shipping-option">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.id}
                          checked={selectedShipping === method.id}
                          onChange={() => setSelectedShipping(method.id)}
                        />
                        <Truck size={18} aria-hidden="true" />
                        <span>
                          <strong>{method.name}</strong>
                          <small>{free ? 'Gratis' : formatIdr(method.flatRateAmount)}</small>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="commerce-form-error" role="alert">
                  Belum ada metode pengiriman aktif. Pesanan fisik belum dapat diproses.
                </p>
              )}
            </fieldset>

            <fieldset className="commerce-form-section">
              <legend>Alamat pengiriman</legend>
              <div className="commerce-form-grid">
                <label className="commerce-form-grid__wide">
                  <span>Nama penerima</span>
                  <input
                    name="recipientName"
                    autoComplete="shipping name"
                    minLength={2}
                    maxLength={120}
                    required
                  />
                </label>
                <label className="commerce-form-grid__wide">
                  <span>Alamat utama</span>
                  <input
                    name="line1"
                    autoComplete="shipping address-line1"
                    minLength={3}
                    maxLength={250}
                    required
                  />
                </label>
                <label className="commerce-form-grid__wide">
                  <span>Detail tambahan (opsional)</span>
                  <input name="line2" autoComplete="shipping address-line2" maxLength={250} />
                </label>
                <label>
                  <span>Kecamatan</span>
                  <input name="district" minLength={2} maxLength={120} required />
                </label>
                <label>
                  <span>Kota/Kabupaten</span>
                  <input
                    name="city"
                    autoComplete="shipping address-level2"
                    minLength={2}
                    maxLength={120}
                    required
                  />
                </label>
                <label>
                  <span>Provinsi</span>
                  <input
                    name="province"
                    autoComplete="shipping address-level1"
                    minLength={2}
                    maxLength={120}
                    required
                  />
                </label>
                <label>
                  <span>Kode pos</span>
                  <input
                    name="postalCode"
                    autoComplete="shipping postal-code"
                    minLength={3}
                    maxLength={12}
                    required
                  />
                </label>
              </div>
            </fieldset>
          </>
        ) : null}

        <fieldset className="commerce-form-section">
          <legend>Catatan (opsional)</legend>
          <label>
            <span>Catatan untuk pesanan</span>
            <textarea name="customerNote" rows={4} maxLength={500} />
          </label>
        </fieldset>

        <div className="commerce-checkout-trust">
          <ShieldCheck size={20} aria-hidden="true" />
          <p>
            Harga, stok, ongkir, dan total diperiksa ulang oleh server. Status pembayaran hanya
            berubah setelah konfirmasi provider yang tervalidasi.
          </p>
        </div>

        <button
          className="commerce-button commerce-button--primary commerce-button--wide"
          type="submit"
          disabled={status === 'submitting' || (requiresShipping && shippingMethods.length === 0)}
        >
          {status === 'submitting' ? 'Membuat transaksi…' : 'Buat pesanan dan lanjut pembayaran'}
        </button>
      </form>

      <aside className="commerce-order-summary commerce-order-summary--checkout">
        <p className="commerce-eyebrow">Pesanan</p>
        <h2>{cart.items.length} jenis produk</h2>
        <div className="commerce-checkout-items">
          {cart.items.map((item) => (
            <div key={item.variantId}>
              <span>
                {item.quantity}× {item.product.name}
                <small>{item.variantName}</small>
              </span>
              <strong>{formatIdr(item.lineTotalAmount)}</strong>
            </div>
          ))}
        </div>
        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatIdr(cart.subtotalAmount)}</dd>
          </div>
          <div>
            <dt>Pengiriman</dt>
            <dd>{requiresShipping ? formatIdr(shippingAmount) : formatIdr(0)}</dd>
          </div>
          <div className="commerce-order-summary__total">
            <dt>Total</dt>
            <dd>{formatIdr(cart.subtotalAmount + shippingAmount)}</dd>
          </div>
        </dl>
        <p className="commerce-order-summary__note">
          Total final berasal dari respons checkout server, bukan kalkulasi browser.
        </p>
      </aside>
    </div>
  );
}
