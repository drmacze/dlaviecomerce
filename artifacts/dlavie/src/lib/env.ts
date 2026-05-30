export function requiredEnv(name: string) {
  // @ts-ignore
  const value = import.meta.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:3000';
