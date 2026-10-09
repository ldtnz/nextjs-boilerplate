/**
 * A worker thread can start under the test setup.
 *
 * The test command's --import flags are inherited by every worker thread, so
 * the setup file is loaded again inside any worker a dependency starts. When
 * that file was TypeScript it could not load there, and the first dependency
 * to use a worker failed with a module-not-found error that pointed at the
 * setup rather than at anything the test did. Nothing in the starter starts a
 * worker of its own, so without this test the breakage would surface only in
 * whichever app first added one.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { Worker } from "node:worker_threads";

test("a worker thread starts and sees the test database", async () => {
  const code = `
    import { parentPort } from "node:worker_threads";
    parentPort.postMessage(process.env.DATABASE_URL);
  `;
  const worker = new Worker(new URL(`data:text/javascript,${encodeURIComponent(code)}`));
  try {
    const databaseUrl = await new Promise((resolve, reject) => {
      worker.once("message", resolve);
      worker.once("error", reject);
    });
    assert.equal(databaseUrl, process.env.DATABASE_URL);
  } finally {
    await worker.terminate();
  }
});
