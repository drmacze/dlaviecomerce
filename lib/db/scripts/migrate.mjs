import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(currentDirectory, "../drizzle");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running migrations.");
}

const sslMode = process.env.DATABASE_SSL_MODE ?? "disable";
if (!new Set(["disable", "require", "verify-full"]).has(sslMode)) {
  throw new Error("DATABASE_SSL_MODE must be disable, require, or verify-full.");
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 1,
  connectionTimeoutMillis: 10_000,
  ssl:
    sslMode === "disable"
      ? false
      : {
          rejectUnauthorized: sslMode === "verify-full",
        },
});

function checksum(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

const client = await pool.connect();
try {
  await client.query("select pg_advisory_lock(hashtext($1))", ["dlavie-commerce-migrations"]);
  await client.query("create schema if not exists dlavie_migrations");
  await client.query(`
    create table if not exists dlavie_migrations.schema_migrations (
      filename text primary key,
      checksum text not null,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await fs.readdir(migrationsDirectory))
    .filter((filename) => /^\d+_.+\.sql$/.test(filename))
    .sort((left, right) => left.localeCompare(right));

  if (files.length === 0) {
    throw new Error(`No SQL migrations were found in ${migrationsDirectory}.`);
  }

  for (const filename of files) {
    const fullPath = path.join(migrationsDirectory, filename);
    const content = await fs.readFile(fullPath, "utf8");
    const contentChecksum = checksum(content);
    const { rows } = await client.query(
      "select checksum from dlavie_migrations.schema_migrations where filename = $1",
      [filename],
    );

    if (rows.length > 0) {
      if (rows[0].checksum !== contentChecksum) {
        throw new Error(
          `Migration ${filename} was modified after being applied. Create a new migration instead.`,
        );
      }
      console.log(`skip ${filename}`);
      continue;
    }

    console.log(`apply ${filename}`);
    await client.query("begin");
    try {
      await client.query("set local lock_timeout = '10s'");
      await client.query("set local statement_timeout = '120s'");
      await client.query(content);
      await client.query(
        "insert into dlavie_migrations.schema_migrations (filename, checksum) values ($1, $2)",
        [filename, contentChecksum],
      );
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }

  console.log("database migrations are up to date");
} finally {
  await client.query("select pg_advisory_unlock(hashtext($1))", ["dlavie-commerce-migrations"]).catch(() => undefined);
  client.release();
  await pool.end();
}
