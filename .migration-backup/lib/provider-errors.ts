export function extractProviderAddress(message: string) {
  const match = String(message || '').match(/([0-9]{1,3}(?:\.[0-9]{1,3}){3})/);
  return match?.[1] || null;
}

export function isProviderAddressBlocked(message: string) {
  const value = String(message || '').toLowerCase();
  return value.includes('not permitted') || value.includes('tidak dikenali') || value.includes('not allowed');
}

export function providerAddressBlockedPayload(message: string) {
  const address = extractProviderAddress(message);
  return {
    code: 'PROVIDER_ADDRESS_BLOCKED',
    error: address
      ? `Server Dlavie belum diizinkan provider. Whitelist alamat server ${address} di dashboard provider, lalu coba lagi.`
      : 'Server Dlavie belum diizinkan provider. Whitelist alamat server di dashboard provider, lalu coba lagi.',
    provider: {
      address,
      action: 'whitelist_provider_address'
    },
    safe_to_retry: Boolean(address)
  };
}
