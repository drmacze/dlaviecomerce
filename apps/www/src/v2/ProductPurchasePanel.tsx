'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, LoaderCircle, ShieldCheck } from 'lucide-react';
import {
  CommerceClientError,
  createCart,
  getCommerceSession,
  setCartItem,
} from '../commerce/client';
import { formatIdr } from '../commerce/format';
import type { ProductDetail } from '../commerce/types';
import {
  deriveCustomerTargetProfile,
  normalizeCustomerTarget,
  validateCustomerTarget,
} from './catalogTarget';
import styles from './product.module.css';

type Locale = 'id' | 'en';

type Props = {
  locale: Locale;
  product: ProductDetail;
};

const copy = {
  id: {
    chooseVariant: 'Pilih nominal atau varian',
    destination: 'Data tujuan',
    required: 'Data tujuan wajib diisi.',
    length: 'Panjang data tujuan belum sesuai.',
    format: 'Gunakan format tujuan yang valid.',
    stock: 'Tersedia',
    unavailable: 'Tidak tersedia',
    total: 'Harga produk',
    add: 'Tambahkan ke keranjang',
    adding: 'Menyimpan pilihan',
    failed: 'Pilihan belum dapat disimpan. Periksa koneksi lalu coba kembali.',
    secure: 'Nomor atau ID tujuan disimpan bersama item cart di server commerce.',
  },
  en: {
    chooseVariant: 'Choose an amount or variant',
    destination: 'Destination details',
    required: 'Destination details are required.',
    length: 'The destination length is not valid yet.',
    format: 'Use a valid destination format.',
    stock: 'Available',
    unavailable: 'Unavailable',
    total: 'Product price',
    add: 'Add to cart',
    adding: 'Saving selection',
    failed: 'The selection could not be saved. Check the connection and try again.',
    secure: 'The destination number or ID is stored with the cart item on the commerce server.',
  },
} as const;

export function ProductPurchasePanel({ locale, product }: Props) {
  const router = useRouter();
  const t = copy[locale];
  const availableVariants = product.variants.filter((variant) => variant.availableQuantity > 0);
  const [variantId, setVariantId] = useState(availableVariants[0]?.id ?? product.variants[0]?.id ?? '');
  const [targetValue, setTargetValue] = useState('');
  const [errorCode, setErrorCode] = useState<'required' | 'length' | 'format' | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === variantId) ?? product.variants[0],
    [product.variants, variantId],
  );
  const profile = useMemo(
    () => deriveCustomerTargetProfile(product, selectedVariant),
    [product, selectedVariant],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    const result = validateCustomerTarget(profile, targetValue);
    if (!result.ok) {
      setErrorCode(result.code);
      return;
    }
    if (!selectedVariant || selectedVariant.availableQuantity < 1) return;

    const normalizedValue = normalizeCustomerTarget(profile, targetValue);
    setTargetValue(normalizedValue);
    setErrorCode(null);
    setSubmitting(true);

    try {
      const session = await getCommerceSession();
      if (!session.cart) await createCart();
      await setCartItem(selectedVariant.id, 1, result.target);
      router.push('/v2/cart');
      router.refresh();
    } catch (error) {
      setServerError(error instanceof CommerceClientError ? error.message : t.failed);
      setSubmitting(false);
    }
  }

  const errorMessage = errorCode ? t[errorCode] : null;
  const purchasable = Boolean(selectedVariant && selectedVariant.availableQuantity > 0);

  return (
    <form className={styles.purchasePanel} onSubmit={handleSubmit} noValidate>
      <div className={styles.purchaseSection}>
        <div className={styles.purchaseHeading}>
          <span>01</span>
          <div>
            <small>{t.chooseVariant}</small>
            <strong>{product.variants.length} pilihan</strong>
          </div>
        </div>

        <div className={styles.variantList} role="radiogroup" aria-label={t.chooseVariant}>
          {product.variants.map((variant) => {
            const available = variant.availableQuantity > 0;
            const active = variant.id === variantId;
            return (
              <label key={variant.id} className={styles.variantOption} data-active={active} data-available={available}>
                <input
                  type="radio"
                  name="variant"
                  value={variant.id}
                  checked={active}
                  disabled={!available || submitting}
                  onChange={() => {
                    setVariantId(variant.id);
                    setServerError(null);
                  }}
                />
                <span>
                  <strong>{variant.name}</strong>
                  <small>{variant.sku}</small>
                </span>
                <b>{formatIdr(variant.priceAmount)}</b>
                <em>{available ? t.stock : t.unavailable}</em>
              </label>
            );
          })}
        </div>
      </div>

      <div className={styles.purchaseSection}>
        <div className={styles.purchaseHeading}>
          <span>02</span>
          <div>
            <small>{t.destination}</small>
            <strong>{profile.label[locale]}</strong>
          </div>
        </div>

        <label className={styles.targetField}>
          <span>{profile.label[locale]}</span>
          <input
            type="text"
            inputMode={profile.inputMode}
            autoComplete="off"
            value={targetValue}
            minLength={profile.minLength}
            maxLength={profile.maxLength}
            placeholder={profile.placeholder[locale]}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby="target-help target-error"
            disabled={submitting}
            onChange={(event) => {
              setTargetValue(event.target.value);
              setErrorCode(null);
              setServerError(null);
            }}
          />
          <small id="target-help">{profile.hint[locale]}</small>
          <em id="target-error" role="alert">
            {errorMessage}
          </em>
        </label>
      </div>

      <div className={styles.purchaseSummary}>
        <span>
          <small>{t.total}</small>
          <strong>{selectedVariant ? formatIdr(selectedVariant.priceAmount) : '—'}</strong>
        </span>
        <button type="submit" disabled={!purchasable || submitting}>
          {submitting ? (
            <LoaderCircle className={styles.spin} size={17} aria-hidden="true" />
          ) : (
            <Check size={17} aria-hidden="true" />
          )}
          {submitting ? t.adding : t.add}
          {!submitting ? <ChevronRight size={17} aria-hidden="true" /> : null}
        </button>
      </div>

      {serverError ? (
        <div className={styles.gateNotice} role="alert">
          <p>{serverError}</p>
        </div>
      ) : null}

      <div className={styles.securityNote}>
        <ShieldCheck size={17} aria-hidden="true" />
        <span>{t.secure}</span>
      </div>
    </form>
  );
}
