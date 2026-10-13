import "server-only";
import { Pool, type PoolClient } from "pg";

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

/** Runs work as site_reader in a read-only transaction, so row-level security shows published content only. */
export async function asReader<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("begin read only");
    await client.query("set local role site_reader");
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
