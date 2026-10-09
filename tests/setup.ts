import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { schemaSql } from "../scripts/schema-sql";

// Preloaded before test modules (and Prisma's dotenv loader). Each test
// process gets an empty database; neither developer nor hosted data is used.
const directory = mkdtempSync(path.join(tmpdir(), "app-test-"));
process.env.DATABASE_URL = `file:${path.join(directory, "test.db")}`;
process.env.TURSO_DATABASE_URL = "";
process.env.TURSO_AUTH_TOKEN = "";
process.on("exit", () => rmSync(directory, { recursive: true, force: true }));

// Use the installed Prisma CLI, so no system SQLite executable is required.
execFileSync(process.execPath, [
  "node_modules/prisma/build/index.js", "db", "execute",
  "--stdin", "--url", process.env.DATABASE_URL,
], { input: schemaSql(), stdio: ["pipe", "pipe", "pipe"] });
