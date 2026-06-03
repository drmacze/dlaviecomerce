export type PasswordStrength = {
  score: number;
  label: 'Weak' | 'Fair' | 'Strong' | 'Very strong';
  feedback: string;
};

export function getPasswordStrength(password: string): PasswordStrength {
  const checks = [
    password.length >= 12,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const passed = checks.filter(Boolean).length;

  if (!password) {
    return {
      score: 0,
      label: 'Weak',
      feedback: 'Use 12+ characters with uppercase, lowercase, numbers, and symbols.',
    };
  }

  if (passed <= 2) {
    return {
      score: 1,
      label: 'Weak',
      feedback: 'Add length and a wider mix of character types.',
    };
  }

  if (passed === 3) {
    return {
      score: 2,
      label: 'Fair',
      feedback: 'Good start. Add symbols or more length for stronger protection.',
    };
  }

  if (passed === 4) {
    return {
      score: 3,
      label: 'Strong',
      feedback: 'Strong password. Add one more character type for maximum resilience.',
    };
  }

  return {
    score: 4,
    label: 'Very strong',
    feedback: 'Excellent. This password meets DLavie secure access guidance.',
  };
}
