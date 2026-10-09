import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { isMainThread } from "node:worker_threads";

// Preloaded before test modules (and Prisma's dotenv loader). Each test
// process gets an empty database; neither developer nor hosted data is used.
//
// This file is plain JavaScript, and it does its work on the main thread only,
// because the --import flags are inherited by every worker thread a test or a
// dependency starts, and in a worker tsx's resolver is not in effect. As
// TypeScript this file was loaded there without it, its extensionless import
// of scripts/schema-sql failed, and the worker died before running a line of
// its own. A worker has nothing to set up anyway: it gets a copy of the main
// thread's environment, DATABASE_URL included, when it is created. For the
// same reason the TypeScript module is imported dynamically, inside the branch.
if (isMainThread) {
  const { schemaSql } = await import("../scripts/schema-sql");

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
}
