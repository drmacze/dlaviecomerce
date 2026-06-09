import { shouldPersistAiHistory } from './persistence';

describe('shouldPersistAiHistory', () => {
  const allowed = { authenticated: true, serverHistoryEnabled: true, clientHistoryEnabled: true, mode: 'fast' };
  it('persists only when every opt-in condition is true', () => expect(shouldPersistAiHistory(allowed)).toBe(true));
  it.each([
    [{ ...allowed, authenticated: false }],
    [{ ...allowed, serverHistoryEnabled: false }],
    [{ ...allowed, clientHistoryEnabled: false }],
    [{ ...allowed, mode: 'private' }],
  ])('prevents persistence for %o', (input) => expect(shouldPersistAiHistory(input)).toBe(false));
});
