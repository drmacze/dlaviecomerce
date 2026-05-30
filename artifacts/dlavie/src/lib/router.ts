/**
 * Wouter router compatibility shim.
 * Replaces next/router patterns with wouter equivalents.
 */
import { useLocation, useRoute, useSearch } from 'wouter';

export function useRouter() {
  const [location, navigate] = useLocation();
  const search = useSearch();

  const query: Record<string, string> = {};
  if (search) {
    const params = new URLSearchParams(search);
    params.forEach((value, key) => { query[key] = value; });
  }

  return {
    pathname: location,
    asPath: location + (search ? '?' + search : ''),
    query,
    isReady: true,
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => window.history.back(),
    // No-op event emitter (not needed with wouter's SPA approach)
    events: {
      on: (_event: string, _handler: () => void) => {},
      off: (_event: string, _handler: () => void) => {},
    },
  };
}

export { useLocation, useRoute, useSearch };
