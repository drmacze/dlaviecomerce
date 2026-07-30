import { describe, expect, it } from 'vitest';
import {
  calculateMidtransSignature,
  mapMidtransStatus,
  parseGrossAmount,
} from '../src/commerce/midtrans.js';

describe('Midtrans integration primitives', () => {
  it('calculates the documented SHA-512 notification signature', () => {
    expect(
      calculateMidtransSignature({
        orderId: 'DLV-20260731-ABCDEF1234',
        statusCode: '200',
        grossAmount: '150000.00',
        serverKey: 'server-key',
      }),
    ).toBe(
      '485f83a3996161f8f888e7c154038bb12a7f8b7905e3bd6acf7c13f4d632234cbe991268e03cb65e87fdf3187c9e2cf566fc3d42c32d21b225f2abe950949271',
    );
  });

  it('accepts integer Rupiah amounts and rejects fractional amounts', () => {
    expect(parseGrossAmount('150000.00')).toBe(150000);
    expect(parseGrossAmount('0')).toBe(0);
    expect(() => parseGrossAmount('150000.50')).toThrow();
  });

  it('maps successful and ambiguous statuses conservatively', () => {
    expect(mapMidtransStatus('settlement', undefined, 'pending')).toBe('paid');
    expect(mapMidtransStatus('capture', 'challenge', 'pending')).toBe('authorized');
    expect(mapMidtransStatus('cancel', undefined, 'paid')).toBe('requires_review');
    expect(mapMidtransStatus('unknown-status', undefined, 'pending')).toBe('requires_review');
  });
});
