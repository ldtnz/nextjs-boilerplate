/**
 * The validation every item route goes through, without a request.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createItemSchema, parseId, TITLE_MAX, updateItemSchema } from "../src/lib/items";

test("a title is trimmed, and whitespace alone is no title", () => {
  assert.equal(createItemSchema.parse({ title: "  Buy milk  " }).title, "Buy milk");
  assert.equal(createItemSchema.safeParse({ title: "   " }).success, false);
});

test("an empty note is stored as no note, not as an empty string", () => {
  assert.equal(createItemSchema.parse({ title: "x", note: "   " }).note, null);
});

test("a title over the limit is refused rather than cut", () => {
  assert.equal(createItemSchema.safeParse({ title: "x".repeat(TITLE_MAX + 1) }).success, false);
});

test("an update must change something", () => {
  assert.equal(updateItemSchema.safeParse({}).success, false);
  assert.equal(updateItemSchema.safeParse({ done: true }).success, true);
});

test("ids from the URL are positive integers or nothing", () => {
  assert.equal(parseId("42"), 42);
  for (const bad of ["0", "-1", "1.5", "abc", ""]) assert.equal(parseId(bad), null, bad);
});
