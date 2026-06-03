import type { FastifyInstance } from 'fastify';
export async function registerRequestContext(app: FastifyInstance) {
  app.addHook('onRequest', async (request) => {
    request.requestStart = Date.now();
  });
}
