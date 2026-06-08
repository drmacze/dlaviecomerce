const getUser = jest.fn();
const maybeSingle = jest.fn();

jest.mock('../lib/errors', () => ({
  AppError: class AppError extends Error {
    constructor(
      public code: string,
      message: string,
      public statusCode: number,
    ) {
      super(message);
    }
  },
}));

jest.mock('../lib/supabase', () => ({
  getSupabaseAnon: () => ({ auth: { getUser } }),
  getSupabaseAdmin: () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
  }),
}));

import { optionalAuth } from './auth';

describe('optionalAuth', () => {
  beforeEach(() => {
    getUser.mockReset();
    maybeSingle.mockReset();
    maybeSingle.mockResolvedValue({ data: { role: 'user' } });
  });

  it('does not crash on a malformed cookie', async () => {
    const headers = new Headers({ cookie: 'dlavie-sb-at=%E0%A4%A' });

    await expect(optionalAuth(headers)).resolves.toBeUndefined();
    expect(getUser).not.toHaveBeenCalled();
  });

  it('keeps Bearer authentication support', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'bearer-user' } }, error: null });
    const headers = new Headers({ authorization: 'Bearer bearer-token' });

    await expect(optionalAuth(headers)).resolves.toMatchObject({ id: 'bearer-user' });
    expect(getUser).toHaveBeenCalledWith('bearer-token');
  });

  it('supports the existing DLavie access cookie', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'cookie-user' } }, error: null });
    const headers = new Headers({ cookie: 'other=value; dlavie-sb-at=cookie-token' });

    await expect(optionalAuth(headers)).resolves.toMatchObject({ id: 'cookie-user' });
    expect(getUser).toHaveBeenCalledWith('cookie-token');
  });
});
