export function getBearerToken(headers: Headers): string | undefined {
  const header = headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice('Bearer '.length).trim();
}
