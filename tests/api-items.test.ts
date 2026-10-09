/**
 * The item routes, driven as routes.
 *
 * These call the real handlers with a real NextRequest against a real
 * database — a fresh one per test process, built by tests/setup.ts from the
 * migrations — so status codes, validation and what actually lands in the
 * row are all part of what is checked. A route mishandling a body is a row
 * changed or lost, which is exactly what a unit test of a helper cannot see.
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

type Routes = typeof import("../src/app/api/items/route");
type ItemRoutes = typeof import("../src/app/api/items/[id]/route");
let list: Routes;
let one: ItemRoutes;

before(async () => {
  list = await import("../src/app/api/items/route");
  one = await import("../src/app/api/items/[id]/route");
});

function json(method: string, url: string, body?: unknown) {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const params = (id: number | string) => ({ params: Promise.resolve({ id: String(id) }) });

async function create(title: string) {
  const res = await list.POST(json("POST", "http://localhost/api/items", { title }));
  assert.equal(res.status, 201);
  return ((await res.json()) as { item: { id: number; title: string; done: boolean } }).item;
}

test("an item can be created, listed, ticked off and deleted", async () => {
  const item = await create("Write the first test");
  assert.equal(item.done, false);

  const listed = (await (await list.GET()).json()) as { items: { id: number }[] };
  assert.ok(listed.items.some((i) => i.id === item.id));

  const patched = await one.PATCH(json("PATCH", `http://localhost/api/items/${item.id}`, { done: true }), params(item.id));
  assert.equal(patched.status, 200);
  assert.equal(((await patched.json()) as { item: { done: boolean } }).item.done, true);

  const deleted = await one.DELETE(json("DELETE", `http://localhost/api/items/${item.id}`), params(item.id));
  assert.equal(deleted.status, 200);
});

test("a body that fails validation is a 400 and writes nothing", async () => {
  const before = ((await (await list.GET()).json()) as { items: unknown[] }).items.length;
  const res = await list.POST(json("POST", "http://localhost/api/items", { title: "   " }));
  assert.equal(res.status, 400);
  const after = ((await (await list.GET()).json()) as { items: unknown[] }).items.length;
  assert.equal(after, before);
});

test("a malformed body is a 400, not a crash", async () => {
  const res = await list.POST(
    new NextRequest("http://localhost/api/items", { method: "POST", body: "{not json" }),
  );
  assert.equal(res.status, 400);
});

test("editing or deleting what is not there is a 404, not a 500", async () => {
  const patched = await one.PATCH(json("PATCH", "http://localhost/api/items/999999", { done: true }), params(999999));
  assert.equal(patched.status, 404);
  const deleted = await one.DELETE(json("DELETE", "http://localhost/api/items/999999"), params(999999));
  assert.equal(deleted.status, 404);
});

test("an id that is not an id is a 400", async () => {
  const res = await one.DELETE(json("DELETE", "http://localhost/api/items/abc"), params("abc"));
  assert.equal(res.status, 400);
});
