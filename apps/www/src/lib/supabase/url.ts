import { assertSupabaseServerConfig } from './env';

export function getSupabaseAuthEndpoint(path: string) {
  const { url } = assertSupabaseServerConfig();
  return `${url.replace(/\/$/, '')}/auth/v1${path}`;
}

export function getSupabaseRequestHeaders() {
  const { key } = assertSupabaseServerConfig();
  const headers = new Headers();
  headers.set('apikey', key);
  headers.set('Content-Type', 'application/json');
  return headers;
}
