import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const binDir = "/usr/lib/postgresql/18/bin";
const dataDir = path.join(os.homedir(), ".local", "share", "crm", "postgres");
const socketDir = path.join(os.homedir(), ".local", "share", "crm", "socket");
const logFile = path.join(os.homedir(), ".local", "share", "crm", "postgres.log");
const username = os.userInfo().username;
const database = "crm_local";
const port = "55432";
const pgCtl = path.join(binDir, "pg_ctl");
const initDb = path.join(binDir, "initdb");

function run(command, args) {
  try {
    execFileSync(command, args, { stdio: "inherit" });
  } catch (error) {
    throw new Error(`Could not run ${path.basename(command)}. ${error.message}`);
  }
}

function isRunning() {
  return spawnSync(pgCtl, ["-D", dataDir, "status"], { stdio: "ignore" }).status === 0;
}

function ensureInitialized() {
  if (existsSync(path.join(dataDir, "PG_VERSION"))) return;
  if (existsSync(dataDir) && statSync(dataDir).isDirectory()) {
    throw new Error(`PostgreSQL data folder exists but is not initialized: ${dataDir}`);
  }

  mkdirSync(dataDir, { recursive: true });
  run(initDb, ["-D", dataDir, "-U", username, "--auth-local=peer", "--auth-host=reject"]);
}

function ensureRunning() {
  mkdirSync(socketDir, { recursive: true, mode: 0o700 });
  chmodSync(socketDir, 0o700);
  if (isRunning()) return;

  const options = `-p ${port} -k '${socketDir}' -c listen_addresses=''`;
  run(pgCtl, ["-D", dataDir, "-l", logFile, "-o", options, "start"]);
}

function ensureDatabase() {
  const psql = path.join(binDir, "psql");
  const result = spawnSync(
    psql,
    ["-h", socketDir, "-p", port, "-U", username, "-d", "postgres", "-tAc", `SELECT 1 FROM pg_database WHERE datname = '${database}'`],
    { encoding: "utf8" },
  );

  if (result.status !== 0) {
    throw new Error(`Could not check local database: ${result.stderr.trim()}`);
  }
  if (result.stdout.trim() === "1") return;

  run(path.join(binDir, "createdb"), ["-h", socketDir, "-p", port, "-U", username, database]);
}

function stop() {
  if (!existsSync(path.join(dataDir, "PG_VERSION")) || !isRunning()) {
    console.log("The local CRM PostgreSQL database is already stopped.");
    return;
  }
  run(pgCtl, ["-D", dataDir, "-m", "fast", "stop"]);
}

try {
  const command = process.argv[2] ?? "setup";
  if (command === "stop") {
    stop();
  } else if (command === "status") {
    console.log(isRunning()
      ? `CRM PostgreSQL is running on private socket ${socketDir}, port ${port}.`
      : "CRM PostgreSQL is stopped. Run `npm run db:setup` to start it.");
  } else if (command === "setup") {
    ensureInitialized();
    ensureRunning();
    ensureDatabase();
    console.log(`Local database "${database}" is ready.`);
  } else {
    throw new Error(`Unknown command "${command}". Use setup, status, or stop.`);
  }
} catch (error) {
  console.error(`Local PostgreSQL setup failed: ${error.message}`);
  process.exitCode = 1;
}
