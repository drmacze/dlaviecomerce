import crypto from 'node:crypto';
import { sha256 } from '../utils/crypto.js';

export function generateOpaqueToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function hashSecret(value: string): string {
  return sha256(value);
}

export function createOrderNumber(prefix: string, now = new Date()): string {
  const date = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
  ].join('');
  const random = crypto.randomBytes(5).toString('hex').toUpperCase();
  return `${prefix}-${date}-${random}`;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stableValue(item)]),
    );
  }
  return value;
}

export function stableJson(value: unknown): string {
  return JSON.stringify(stableValue(value));
}

export function hashPayload(value: unknown): string {
  return sha256(stableJson(value));
}
