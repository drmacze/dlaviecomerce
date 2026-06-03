'use client';

import { getPasswordStrength } from './passwordStrength';

type PasswordStrengthMeterProps = {
  value: string;
};

export function PasswordStrengthMeter({ value }: PasswordStrengthMeterProps) {
  const strength = getPasswordStrength(value);
  const progress = Math.max(8, strength.score * 25);

  return (
    <div className="account-strength" data-score={strength.score}>
      <div className="account-strength__meta">
        <span>Password strength</span>
        <strong>{strength.label}</strong>
      </div>
      <div className="account-strength__track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <p>{strength.feedback}</p>
    </div>
  );
}
