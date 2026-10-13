import "server-only";
import { Pool, type PoolClient } from "pg";
import type { Admin } from "@/features/admin/session";

let pool: Pool | undefined;

function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set: run `vercel env pull .env.local`, or point it at a Postgres with db/migrations applied");
  }
  // Exit on idle so `next build` workers don't hang on open connections
  pool = new Pool({ connectionString, max: 3, allowExitOnIdle: true });
  return pool;
}

type Role = "site_reader" | "site_admin";

async function inTransaction<T>(role: Role, readOnly: boolean, work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query(readOnly ? "begin read only" : "begin");
    await client.query(`set local role ${role}`);
    const result = await work(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

/** Runs work as site_reader in a read-only transaction, so row-level security shows published content only. */
export function asReader<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  return inTransaction("site_reader", true, work);
}

/** Runs work as site_admin; taking the Admin from requireAdmin() means no write runs before the session check. */
export function asAdmin<T>(_admin: Admin, work: (client: PoolClient) => Promise<T>): Promise<T> {
  return inTransaction("site_admin", false, work);
}
