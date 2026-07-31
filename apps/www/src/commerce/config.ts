export class CommerceConfigurationError extends Error {
  constructor(message = 'Commerce API is not configured.') {
    super(message);
    this.name = 'CommerceConfigurationError';
  }
}

export function getCommerceApiUrl(): URL {
  const rawUrl = process.env.COMMERCE_API_URL?.trim();
  if (!rawUrl) throw new CommerceConfigurationError();

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new CommerceConfigurationError('COMMERCE_API_URL must be a valid absolute URL.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new CommerceConfigurationError('COMMERCE_API_URL must use HTTP or HTTPS.');
  }
  if (
    process.env.NODE_ENV === 'production' &&
    url.protocol !== 'https:' &&
    !['localhost', '127.0.0.1'].includes(url.hostname)
  ) {
    throw new CommerceConfigurationError('COMMERCE_API_URL must use HTTPS in production.');
  }

  url.pathname = url.pathname.replace(/\/$/, '');
  return url;
}

export function commerceApiPath(pathname: string): URL {
  const base = getCommerceApiUrl();
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return new URL(`${base.pathname}${normalizedPath}`, `${base.protocol}//${base.host}`);
}
