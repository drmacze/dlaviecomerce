import 'server-only';
import { commerceApiPath, CommerceConfigurationError } from './config';
import { embeddedCommerceFetch, EmbeddedCommerceConfigurationError } from './embedded';

export { CommerceConfigurationError, EmbeddedCommerceConfigurationError };

export async function commerceBackendFetch(
  pathname: string,
  options: {
    method?: string;
    headers?: Headers;
    body?: ArrayBuffer;
    origin?: string;
    timeoutMs?: number;
  } = {},
): Promise<Response> {
  if (!process.env.COMMERCE_API_URL?.trim()) {
    return embeddedCommerceFetch(pathname, options);
  }

  const target = commerceApiPath(pathname);
  const method = options.method ?? 'GET';
  return fetch(target, {
    method,
    headers: options.headers,
    ...(!['GET', 'HEAD'].includes(method) && options.body ? { body: options.body } : {}),
    cache: 'no-store',
    redirect: 'manual',
    signal: AbortSignal.timeout(options.timeoutMs ?? 20_000),
  });
}
