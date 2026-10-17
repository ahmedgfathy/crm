import "dotenv/config";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, unlinkSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backupDir = path.join(projectDir, "backups");
const backupFile = path.join(backupDir, "crm_local.dump");
const localSocket = path.join(os.homedir(), ".local", "share", "crm", "socket");

mkdirSync(backupDir, { recursive: true, mode: 0o700 });
if (process.platform !== "win32") chmodSync(backupDir, 0o700);

const result = spawnSync(
  process.env.PG_DUMP || "pg_dump",
  [
    "--format=custom",
    "--compress=9",
    "--no-owner",
    "--no-privileges",
    "--host", process.env.PGHOST || localSocket,
    "--port", process.env.PGPORT || "55432",
    "--username", process.env.PGUSER || os.userInfo().username,
    "--dbname", process.env.PGDATABASE || "crm_local",
    "--file", backupFile,
  ],
  { stdio: "inherit", env: process.env },
);

if (result.error || result.status !== 0) {
  try {
    unlinkSync(backupFile);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  console.error(`Database dump failed${result.error ? `: ${result.error.message}` : "."}`);
  process.exitCode = 1;
} else {
  if (process.platform !== "win32") chmodSync(backupFile, 0o600);
  console.log(`Compressed PostgreSQL backup saved to ${path.relative(projectDir, backupFile)}.`);
}
