import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set. Commerce data requires a PostgreSQL database.");
}

const poolMax = Number.parseInt(process.env.DATABASE_POOL_MAX ?? "10", 10);
if (!Number.isSafeInteger(poolMax) || poolMax < 1 || poolMax > 50) {
  throw new Error("DATABASE_POOL_MAX must be an integer between 1 and 50.");
}

const sslMode = process.env.DATABASE_SSL_MODE ?? "disable";
if (!new Set(["disable", "require", "verify-full"]).has(sslMode)) {
  throw new Error("DATABASE_SSL_MODE must be disable, require, or verify-full.");
}

export const pool = new Pool({
  connectionString: databaseUrl,
  max: poolMax,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ssl:
    sslMode === "disable"
      ? false
      : {
          rejectUnauthorized: sslMode === "verify-full",
        },
});

export const db = drizzle(pool, { schema });

export {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lt,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";
export * from "./schema";
