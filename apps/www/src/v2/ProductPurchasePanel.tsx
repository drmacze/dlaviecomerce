'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronRight, Info, ShieldCheck } from 'lucide-react';
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
    validate: 'Periksa pilihan',
    verified: 'Pilihan dan data tujuan sudah valid.',
    gateNotice:
      'Keranjang server v2 akan diaktifkan pada tahap transaksi. Belum ada pesanan atau pembayaran yang dibuat.',
    secure: 'Data tujuan hanya akan dikirim ke server commerce saat transaksi v2 diaktifkan.',
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
    validate: 'Review selection',
    verified: 'The selection and destination are valid.',
    gateNotice:
      'The v2 server cart will be enabled in the transaction gate. No order or payment has been created.',
    secure: 'Destination data will only be sent to the commerce server when v2 transactions are enabled.',
  },
} as const;

export function ProductPurchasePanel({ locale, product }: Props) {
  const t = copy[locale];
  const availableVariants = product.variants.filter((variant) => variant.availableQuantity > 0);
  const [variantId, setVariantId] = useState(availableVariants[0]?.id ?? product.variants[0]?.id ?? '');
  const [targetValue, setTargetValue] = useState('');
  const [errorCode, setErrorCode] = useState<'required' | 'length' | 'format' | null>(null);
  const [verified, setVerified] = useState(false);

  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === variantId) ?? product.variants[0],
    [product.variants, variantId],
  );
  const profile = useMemo(
    () => deriveCustomerTargetProfile(product, selectedVariant),
    [product, selectedVariant],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVerified(false);
    const result = validateCustomerTarget(profile, targetValue);
    if (!result.ok) {
      setErrorCode(result.code);
      return;
    }
    setTargetValue(normalizeCustomerTarget(profile, targetValue));
    setErrorCode(null);
    setVerified(true);
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
                  disabled={!available}
                  onChange={() => {
                    setVariantId(variant.id);
                    setVerified(false);
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
            onChange={(event) => {
              setTargetValue(event.target.value);
              setErrorCode(null);
              setVerified(false);
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
        <button type="submit" disabled={!purchasable}>
          {verified ? <Check size={17} aria-hidden="true" /> : null}
          {verified ? t.verified : t.validate}
          {!verified ? <ChevronRight size={17} aria-hidden="true" /> : null}
        </button>
      </div>

      {verified ? (
        <div className={styles.gateNotice} role="status">
          <Info size={18} aria-hidden="true" />
          <p>{t.gateNotice}</p>
        </div>
      ) : null}

      <div className={styles.securityNote}>
        <ShieldCheck size={17} aria-hidden="true" />
        <span>{t.secure}</span>
      </div>
    </form>
  );
}
