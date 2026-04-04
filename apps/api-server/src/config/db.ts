import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema";
import { env } from "./env";

const connectionString = env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1") ? false : { rejectUnauthorized: false },
  max: 20,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});

export const db = drizzle(pool, { schema });
export { pool, schema };

export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
}
