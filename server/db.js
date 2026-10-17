import "dotenv/config";
import { readFile } from "node:fs/promises";
import os from "node:os";
import pg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { Pool } = pg;
const localSocket = path.join(os.homedir(), ".local", "share", "crm", "socket");
const pool = new Pool({
  host: process.env.PGHOST || localSocket,
  port: Number(process.env.PGPORT || 55432),
  database: process.env.PGDATABASE || "crm_local",
  user: process.env.PGUSER || os.userInfo().username,
  password: process.env.PGPASSWORD || undefined,
});

export async function initializeDatabase() {
  const schemaPath = fileURLToPath(new URL("./schema.sql", import.meta.url));
  await pool.query(await readFile(schemaPath, "utf8"));
}

export async function query(text, values) {
  return pool.query(text, values);
}

export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function closeDatabase() {
  await pool.end();
}
