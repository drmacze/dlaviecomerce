export type ProviderMode = 'disabled' | 'sandbox' | 'production' | 'mismatch';

export type ProviderReadinessInput = {
  commerceEnabled: boolean;
  paymentsEnabled: boolean;
  midtransConfigured: boolean;
  midtransProduction: boolean;
  digiflazzEnabled: boolean;
  digiflazzConfigured: boolean;
  digiflazzTesting: boolean;
  databaseConfigured: boolean;
  sessionSecretConfigured: boolean;
  adminKeyConfigured: boolean;
};

export type ProviderReadiness = {
  mode: ProviderMode;
  readyForSandbox: boolean;
  readyForProduction: boolean;
  blockers: string[];
  checks: {
    commerce: boolean;
    database: boolean;
    sessionSecurity: boolean;
    adminSecurity: boolean;
    midtrans: boolean;
    digiflazz: boolean;
    environmentsAligned: boolean;
  };
  endpoints: {
    midtransNotificationPath: string;
    providerStatusPath: string;
    catalogSyncPath: string;
    fulfillmentProcessPath: string;
  };
};

export function providerMode(input: ProviderReadinessInput): ProviderMode {
  if (!input.paymentsEnabled && !input.digiflazzEnabled) return 'disabled';
  if (!input.midtransProduction && input.digiflazzTesting) return 'sandbox';
  if (input.midtransProduction && !input.digiflazzTesting) return 'production';
  return 'mismatch';
}

export function buildProviderReadiness(input: ProviderReadinessInput): ProviderReadiness {
  const mode = providerMode(input);
  const blockers: string[] = [];

  if (!input.commerceEnabled) blockers.push('Commerce API is disabled.');
  if (!input.databaseConfigured) blockers.push('DATABASE_URL is not configured.');
  if (!input.sessionSecretConfigured) {
    blockers.push('COMMERCE_SESSION_SECRET is missing or too short.');
  }
  if (!input.adminKeyConfigured) blockers.push('ADMIN_API_KEY is missing or too short.');
  if (!input.paymentsEnabled) blockers.push('Payments are disabled.');
  if (!input.midtransConfigured) blockers.push('Midtrans server key is not configured.');
  if (!input.digiflazzEnabled) blockers.push('Digiflazz integration is disabled.');
  if (!input.digiflazzConfigured) blockers.push('Digiflazz credentials are not configured.');
  if (mode === 'mismatch') {
    blockers.push(
      'Provider environments are mixed. Use Midtrans sandbox with Digiflazz testing, or enable both production environments together.',
    );
  }

  const commonReady =
    input.commerceEnabled &&
    input.databaseConfigured &&
    input.sessionSecretConfigured &&
    input.adminKeyConfigured &&
    input.paymentsEnabled &&
    input.midtransConfigured &&
    input.digiflazzEnabled &&
    input.digiflazzConfigured;

  return {
    mode,
    readyForSandbox: commonReady && mode === 'sandbox',
    readyForProduction: commonReady && mode === 'production',
    blockers,
    checks: {
      commerce: input.commerceEnabled,
      database: input.databaseConfigured,
      sessionSecurity: input.sessionSecretConfigured,
      adminSecurity: input.adminKeyConfigured,
      midtrans: input.paymentsEnabled && input.midtransConfigured,
      digiflazz: input.digiflazzEnabled && input.digiflazzConfigured,
      environmentsAligned: mode === 'sandbox' || mode === 'production',
    },
    endpoints: {
      midtransNotificationPath: '/v2/webhooks/midtrans',
      providerStatusPath: '/v2/admin/commerce/readiness',
      catalogSyncPath: '/v1/admin/commerce/providers/digiflazz/sync',
      fulfillmentProcessPath: '/v2/admin/commerce/fulfillments/process-due',
    },
  };
}
