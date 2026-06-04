import { createAccountSessionView, createUnauthenticatedAccountSession, getInitials } from './account-session';

describe('DLavie account session view model', () => {
  it('creates a safe unauthenticated public session', () => {
    expect(createUnauthenticatedAccountSession()).toMatchObject({
      authenticated: false,
      userId: null,
      fullName: 'DLavie member',
      initials: 'DL',
    });
  });

  it('normalizes Supabase user metadata for the AI app shell', () => {
    expect(
      createAccountSessionView({
        id: 'user-1',
        email: 'nadia@example.com',
        user_metadata: { full_name: 'Nadia Putri', product_interest: 'PPOB' },
      }),
    ).toMatchObject({
      authenticated: true,
      userId: 'user-1',
      email: 'nadia@example.com',
      fullName: 'Nadia Putri',
      initials: 'NP',
      productInterest: 'PPOB',
    });
  });

  it('falls back to email-derived initials when a full name is unavailable', () => {
    expect(getInitials('DLavie member', 'commerce.owner@example.com')).toBe('CO');
  });
});
