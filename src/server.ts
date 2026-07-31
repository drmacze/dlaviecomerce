import { env } from './config/env.js';
import { buildApp } from './app.js';

const app = await buildApp();
let shutdownPromise: Promise<void> | null = null;

async function closeDatabase(): Promise<void> {
  if (!env.ENABLE_COMMERCE) return;
  const { pool } = await import('../lib/db/src/index.js');
  await pool.end();
}

async function shutdown(signal: NodeJS.Signals | 'fatal'): Promise<void> {
  if (shutdownPromise) return shutdownPromise;

  shutdownPromise = (async () => {
    app.log.info({ signal }, 'Shutting down API');
    const forceExit = setTimeout(() => {
      app.log.fatal({ signal }, 'Graceful shutdown timed out');
      process.exit(1);
    }, 15_000);
    forceExit.unref();

    try {
      await app.close();
      await closeDatabase();
      clearTimeout(forceExit);
      app.log.info({ signal }, 'API shutdown complete');
    } catch (error) {
      clearTimeout(forceExit);
      app.log.error({ err: error, signal }, 'API shutdown failed');
      process.exitCode = 1;
    }
  })();

  return shutdownPromise;
}

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    void shutdown(signal);
  });
}

process.once('uncaughtException', (error) => {
  app.log.fatal({ err: error }, 'Uncaught exception');
  process.exitCode = 1;
  void shutdown('fatal');
});

process.once('unhandledRejection', (error) => {
  app.log.fatal({ err: error }, 'Unhandled rejection');
  process.exitCode = 1;
  void shutdown('fatal');
});

await app.listen({ port: env.PORT, host: '0.0.0.0' });
app.log.info({ port: env.PORT }, 'DLavie API listening');
