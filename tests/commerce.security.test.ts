import { describe, expect, it } from 'vitest';
import {
  createOrderNumber,
  generateOpaqueToken,
  hashPayload,
  hashSecret,
  stableJson,
} from '../src/commerce/security.js';

describe('commerce security primitives', () => {
  it('creates opaque high-entropy tokens that are not stored directly', () => {
    const first = generateOpaqueToken();
    const second = generateOpaqueToken();

    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(second).not.toBe(first);
    expect(hashSecret(first)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashSecret(first)).not.toBe(first);
  });

  it('creates order numbers without customer information', () => {
    const orderNumber = createOrderNumber('DLV', new Date('2026-07-31T00:00:00.000Z'));
    expect(orderNumber).toMatch(/^DLV-20260731-[A-F0-9]{10}$/);
  });

  it('hashes semantically identical payloads deterministically', () => {
    const left = { status: 'paid', details: { b: 2, a: 1 } };
    const right = { details: { a: 1, b: 2 }, status: 'paid' };

    expect(stableJson(left)).toBe(stableJson(right));
    expect(hashPayload(left)).toBe(hashPayload(right));
  });
});
