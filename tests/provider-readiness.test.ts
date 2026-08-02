import { describe, expect, it } from 'vitest';
import {
  buildProviderReadiness,
  providerMode,
  type ProviderReadinessInput,
} from '../src/commerce/providerReadiness.js';

const readyBase: ProviderReadinessInput = {
  commerceEnabled: true,
  paymentsEnabled: true,
  midtransConfigured: true,
  midtransProduction: false,
  digiflazzEnabled: true,
  digiflazzConfigured: true,
  digiflazzTesting: true,
  databaseConfigured: true,
  sessionSecretConfigured: true,
  adminKeyConfigured: true,
};

describe('provider activation readiness', () => {
  it('recognizes the aligned sandbox configuration', () => {
    const readiness = buildProviderReadiness(readyBase);
    expect(readiness.mode).toBe('sandbox');
    expect(readiness.readyForSandbox).toBe(true);
    expect(readiness.readyForProduction).toBe(false);
    expect(readiness.blockers).toEqual([]);
  });

  it('recognizes the aligned production configuration', () => {
    const readiness = buildProviderReadiness({
      ...readyBase,
      midtransProduction: true,
      digiflazzTesting: false,
    });
    expect(readiness.mode).toBe('production');
    expect(readiness.readyForProduction).toBe(true);
    expect(readiness.readyForSandbox).toBe(false);
  });

  it('blocks mixed provider environments', () => {
    const input = {
      ...readyBase,
      midtransProduction: false,
      digiflazzTesting: false,
    };
    expect(providerMode(input)).toBe('mismatch');
    const readiness = buildProviderReadiness(input);
    expect(readiness.readyForSandbox).toBe(false);
    expect(readiness.readyForProduction).toBe(false);
    expect(readiness.blockers).toContainEqual(expect.stringContaining('environments are mixed'));
  });

  it('reports missing credentials without exposing credential values', () => {
    const readiness = buildProviderReadiness({
      ...readyBase,
      midtransConfigured: false,
      digiflazzConfigured: false,
      sessionSecretConfigured: false,
    });
    expect(readiness.readyForSandbox).toBe(false);
    expect(readiness.blockers).toEqual(
      expect.arrayContaining([
        'COMMERCE_SESSION_SECRET is missing or too short.',
        'Midtrans server key is not configured.',
        'Digiflazz credentials are not configured.',
      ]),
    );
    expect(JSON.stringify(readiness)).not.toContain('serverKey');
    expect(JSON.stringify(readiness)).not.toContain('apiKey');
  });
});
