import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'pg';

const migrationFilename = /^\d+_.+\.sql$/;
const migrationLockName = 'dlavie-commerce-migrations';

async function directoryExists(directory: string): Promise<boolean> {
  try {
    return (await fs.stat(directory)).isDirectory();
  } catch {
    return false;
  }
}

async function resolveMigrationsDirectory(explicit?: string): Promise<string> {
  const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    explicit,
    process.env.DLAVIE_MIGRATIONS_DIR,
    path.resolve(process.cwd(), 'lib/db/drizzle'),
    path.resolve(process.cwd(), '../../lib/db/drizzle'),
    path.resolve(sourceDirectory, '../drizzle'),
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of [...new Set(candidates)]) {
    if (await directoryExists(candidate)) return candidate;
  }

  throw new Error('Commerce migration files are not available in this runtime.');
}

function checksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function runMigrations(
  pool: Pool,
  options: { migrationsDirectory?: string; log?: (message: string) => void } = {},
): Promise<void> {
  const migrationsDirectory = await resolveMigrationsDirectory(options.migrationsDirectory);
  const log = options.log ?? (() => undefined);
  const client = await pool.connect();

  try {
    await client.query('select pg_advisory_lock(hashtext($1))', [migrationLockName]);
    await client.query('create schema if not exists dlavie_migrations');
    await client.query(`
      create table if not exists dlavie_migrations.schema_migrations (
        filename text primary key,
        checksum text not null,
        applied_at timestamptz not null default now()
      )
    `);

    const files = (await fs.readdir(migrationsDirectory))
      .filter((filename) => migrationFilename.test(filename))
      .sort((left, right) => left.localeCompare(right));

    if (files.length === 0) {
      throw new Error(`No SQL migrations were found in ${migrationsDirectory}.`);
    }

    for (const filename of files) {
      const content = await fs.readFile(path.join(migrationsDirectory, filename), 'utf8');
      const contentChecksum = checksum(content);
      const { rows } = await client.query<{ checksum: string }>(
        'select checksum from dlavie_migrations.schema_migrations where filename = $1',
        [filename],
      );

      if (rows.length > 0) {
        if (rows[0]?.checksum !== contentChecksum) {
          throw new Error(
            `Migration ${filename} was modified after being applied. Create a new migration instead.`,
          );
        }
        log(`skip ${filename}`);
        continue;
      }

      log(`apply ${filename}`);
      await client.query('begin');
      try {
        await client.query("set local lock_timeout = '10s'");
        await client.query("set local statement_timeout = '120s'");
        await client.query(content);
        await client.query(
          'insert into dlavie_migrations.schema_migrations (filename, checksum) values ($1, $2)',
          [filename, contentChecksum],
        );
        await client.query('commit');
      } catch (error) {
        await client.query('rollback');
        throw error;
      }
    }
  } finally {
    await client
      .query('select pg_advisory_unlock(hashtext($1))', [migrationLockName])
      .catch(() => undefined);
    client.release();
  }
}
