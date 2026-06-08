import { createAccountSessionView, getAccountProviders } from './account-session';

describe('account session view', () => {
  it('normalizes Google metadata and identity', () => {
    const user = { id: 'google-user', email: 'ada@example.com', user_metadata: { full_name: 'Ada Lovelace' }, identities: [{ provider: 'google' }] };
    expect(createAccountSessionView(user)).toMatchObject({ authenticated: true, fullName: 'Ada Lovelace', initials: 'AL' });
    expect(getAccountProviders(user)).toEqual(['google']);
  });
  it('normalizes GitHub metadata and identity', () => {
    const user = { id: 'github-user', email: 'grace@example.com', user_metadata: { user_name: 'grace-hopper' }, identities: [{ provider: 'github' }] };
    expect(createAccountSessionView(user)).toMatchObject({ fullName: 'grace-hopper', initials: 'GH' });
    expect(getAccountProviders(user)).toEqual(['github']);
  });
  it('uses email initials as a fallback', () => {
    expect(createAccountSessionView({ id: 'email-user', email: 'hello.world@example.com' }).initials).toBe('HW');
  });
});
