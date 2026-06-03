import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
describe('health route', () => {
  it('works', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ ok: true, service: 'DLavie AI Backend', version: '1.0.0' });
    await app.close();
  });
});
