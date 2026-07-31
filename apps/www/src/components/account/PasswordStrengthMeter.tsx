'use client';

import { useDlavieLocale } from '../i18n/LocaleExperience';
import { getPasswordStrength } from './passwordStrength';

type PasswordStrengthMeterProps = {
  value: string;
};

const labels = {
  Weak: { en: 'Weak', id: 'Lemah' },
  Fair: { en: 'Fair', id: 'Cukup' },
  Strong: { en: 'Strong', id: 'Kuat' },
  'Very strong': { en: 'Very strong', id: 'Sangat kuat' },
} as const;

const feedback = {
  'Use 12+ characters with uppercase, lowercase, numbers, and symbols.': {
    en: 'Use 12+ characters with uppercase, lowercase, numbers, and symbols.',
    id: 'Gunakan 12+ karakter dengan huruf besar, huruf kecil, angka, dan simbol.',
  },
  'Add length and a wider mix of character types.': {
    en: 'Add length and a wider mix of character types.',
    id: 'Tambahkan panjang dan variasi jenis karakter.',
  },
  'Good start. Add symbols or more length for stronger protection.': {
    en: 'Good start. Add symbols or more length for stronger protection.',
    id: 'Awal yang baik. Tambahkan simbol atau panjang untuk perlindungan yang lebih kuat.',
  },
  'Strong password. Add one more character type for maximum resilience.': {
    en: 'Strong password. Add one more character type for maximum resilience.',
    id: 'Kata sandi kuat. Tambahkan satu jenis karakter lagi untuk perlindungan maksimal.',
  },
  'Excellent. This password meets DLavie secure access guidance.': {
    en: 'Excellent. This password meets DLavie secure access guidance.',
    id: 'Sangat baik. Kata sandi ini memenuhi panduan akses aman DLavie.',
  },
} as const;

export function PasswordStrengthMeter({ value }: PasswordStrengthMeterProps) {
  const { locale } = useDlavieLocale();
  const strength = getPasswordStrength(value);
  const progress = Math.max(8, strength.score * 25);

  return (
    <div className="account-strength" data-score={strength.score}>
      <div className="account-strength__meta">
        <span>{locale === 'id' ? 'Kekuatan kata sandi' : 'Password strength'}</span>
        <strong>{labels[strength.label][locale]}</strong>
      </div>
      <div className="account-strength__track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <p>{feedback[strength.feedback as keyof typeof feedback]?.[locale] ?? strength.feedback}</p>
    </div>
  );
}
