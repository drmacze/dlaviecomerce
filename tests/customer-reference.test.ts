import { describe, expect, it } from 'vitest';
import {
  cartItemMutationSchema,
  normalizeCustomerReference,
} from '../src/commerce/customerReference.js';

describe('customer reference validation', () => {
  it('normalizes numeric references before persistence', () => {
    expect(normalizeCustomerReference({ kind: 'phone', value: '0812-3456 7890' })).toEqual({
      kind: 'phone',
      value: '081234567890',
    });
  });

  it('accepts a target-aware cart mutation', () => {
    expect(
      cartItemMutationSchema.parse({
        quantity: 1,
        customerReference: { kind: 'game_id', value: '12345678(1234)' },
      }),
    ).toEqual({
      quantity: 1,
      customerReference: { kind: 'game_id', value: '12345678(1234)' },
    });
  });

  it('rejects unsafe customer reference characters', () => {
    expect(() =>
      cartItemMutationSchema.parse({
        quantity: 1,
        customerReference: { kind: 'account_id', value: '<script>' },
      }),
    ).toThrow();
  });
});
