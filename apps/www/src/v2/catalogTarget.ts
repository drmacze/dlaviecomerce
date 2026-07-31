import type { CatalogProduct, ProductDetail, ProductVariant } from '../commerce/types';

export type CustomerTargetKind =
  | 'phone'
  | 'meter_number'
  | 'customer_id'
  | 'game_id'
  | 'account_id';

export type CustomerTargetProfile = {
  kind: CustomerTargetKind;
  inputMode: 'numeric' | 'text';
  minLength: number;
  maxLength: number;
  label: { id: string; en: string };
  placeholder: { id: string; en: string };
  hint: { id: string; en: string };
};

export type CustomerTarget = {
  kind: CustomerTargetKind;
  value: string;
};

type ProductLike = Pick<CatalogProduct | ProductDetail, 'name' | 'description' | 'category'>;

type VariantLike = Pick<ProductVariant, 'attributes'>;

const profiles: Record<CustomerTargetKind, CustomerTargetProfile> = {
  phone: {
    kind: 'phone',
    inputMode: 'numeric',
    minLength: 8,
    maxLength: 15,
    label: { id: 'Nomor tujuan', en: 'Destination number' },
    placeholder: { id: 'Contoh: 081234567890', en: 'Example: 081234567890' },
    hint: {
      id: 'Periksa kembali nomor sebelum melanjutkan. Produk digital tidak dapat dipindahkan setelah diproses.',
      en: 'Check the number carefully. A processed digital product cannot be transferred.',
    },
  },
  meter_number: {
    kind: 'meter_number',
    inputMode: 'numeric',
    minLength: 8,
    maxLength: 20,
    label: { id: 'Nomor meter', en: 'Meter number' },
    placeholder: { id: 'Masukkan nomor meter PLN', en: 'Enter the PLN meter number' },
    hint: {
      id: 'Gunakan nomor meter yang tercantum pada perangkat atau struk PLN.',
      en: 'Use the meter number printed on the device or PLN receipt.',
    },
  },
  customer_id: {
    kind: 'customer_id',
    inputMode: 'numeric',
    minLength: 5,
    maxLength: 32,
    label: { id: 'ID pelanggan', en: 'Customer ID' },
    placeholder: { id: 'Masukkan ID pelanggan', en: 'Enter the customer ID' },
    hint: {
      id: 'ID pelanggan harus sama dengan data yang terdaftar pada penyedia layanan.',
      en: 'The customer ID must match the service provider record.',
    },
  },
  game_id: {
    kind: 'game_id',
    inputMode: 'text',
    minLength: 3,
    maxLength: 40,
    label: { id: 'User ID / server', en: 'User ID / server' },
    placeholder: { id: 'Contoh: 12345678(1234)', en: 'Example: 12345678(1234)' },
    hint: {
      id: 'Masukkan format ID dan server sesuai petunjuk di dalam game.',
      en: 'Enter the ID and server in the format shown inside the game.',
    },
  },
  account_id: {
    kind: 'account_id',
    inputMode: 'text',
    minLength: 3,
    maxLength: 64,
    label: { id: 'ID akun atau pelanggan', en: 'Account or customer ID' },
    placeholder: { id: 'Masukkan identitas tujuan', en: 'Enter the destination identity' },
    hint: {
      id: 'Pastikan identitas tujuan sesuai dengan layanan yang dipilih.',
      en: 'Make sure the destination identity matches the selected service.',
    },
  },
};

function searchableText(product: ProductLike, variant?: VariantLike): string {
  const attributes = variant?.attributes ?? {};
  return [
    product.name,
    product.description,
    product.category?.name,
    attributes.category,
    attributes.brand,
    attributes.type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function deriveCustomerTargetProfile(
  product: ProductLike,
  variant?: VariantLike,
): CustomerTargetProfile {
  const explicitKind = variant?.attributes.targetKind as CustomerTargetKind | undefined;
  if (explicitKind && explicitKind in profiles) return profiles[explicitKind];

  const text = searchableText(product, variant);

  if (/pln|token listrik|listrik prabayar/.test(text)) return profiles.meter_number;
  if (/pdam|bpjs|pascabayar|tagihan|internet|tv kabel|multifinance/.test(text)) {
    return profiles.customer_id;
  }
  if (/game|diamond|mobile legends|free fire|pubg|valorant|steam|garena/.test(text)) {
    return profiles.game_id;
  }
  if (/pulsa|paket data|data internet|sms|telepon|e-wallet|ewallet|ovo|dana|gopay|shopeepay/.test(text)) {
    return profiles.phone;
  }
  return profiles.account_id;
}

export function normalizeCustomerTarget(profile: CustomerTargetProfile, value: string): string {
  const trimmed = value.trim();
  if (profile.inputMode === 'numeric') return trimmed.replace(/[^0-9]/g, '');
  return trimmed.replace(/\s+/g, ' ');
}

export function validateCustomerTarget(
  profile: CustomerTargetProfile,
  value: string,
): { ok: true; target: CustomerTarget } | { ok: false; code: 'required' | 'length' | 'format' } {
  const normalized = normalizeCustomerTarget(profile, value);
  if (!normalized) return { ok: false, code: 'required' };
  if (normalized.length < profile.minLength || normalized.length > profile.maxLength) {
    return { ok: false, code: 'length' };
  }

  const numericValid = /^[0-9]+$/.test(normalized);
  const textValid = /^[0-9A-Za-z._:@+()\- ]+$/.test(normalized);
  if ((profile.inputMode === 'numeric' && !numericValid) || (profile.inputMode === 'text' && !textValid)) {
    return { ok: false, code: 'format' };
  }

  return { ok: true, target: { kind: profile.kind, value: normalized } };
}
