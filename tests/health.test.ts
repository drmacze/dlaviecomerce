import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('health routes', () => {
  it('reports enabled features without loading optional modules', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      ok: true,
      service: 'DLavie Platform API',
      version: '1.1.0',
      features: { commerce: false, payments: false, ai: false },
    });
    await app.close();
  });

  it('is ready when no optional runtime is enabled', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/health/ready' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ ok: true, checks: {} });
    await app.close();
  });
});
