import { getBearerToken } from '../lib/http';

describe('Next.js API backend HTTP helpers', () => {
  it('extracts bearer tokens from request headers', () => {
    const headers = new Headers({ authorization: 'Bearer token-123' });
    expect(getBearerToken(headers)).toBe('token-123');
  });

  it('returns undefined for non-bearer authorization headers', () => {
    const headers = new Headers({ authorization: 'Basic token-123' });
    expect(getBearerToken(headers)).toBeUndefined();
  });
});
