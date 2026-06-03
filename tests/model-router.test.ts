import { describe, expect, it } from 'vitest';
import { ModelRouterService } from '../src/services/chat/model-router.service.js';
describe('model router', () => {
  it('selects webdev route', () => {
    const route = new ModelRouterService().route({
      mode: 'webdev',
      messageTokens: 100,
      useRag: false,
    });
    expect(route.providerName).toBe('openai');
    expect(route.temperature).toBe(0.2);
  });
});
