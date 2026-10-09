import { z } from "zod";
import type { Prisma } from "@prisma/client";

/**
 * The example entity's shape at the edges of the app: what a request may
 * carry, and what a page is sent.
 *
 * Validation lives here rather than inline in the routes so a test can
 * exercise it without a request, and so the limits are written once.
 */

export const TITLE_MAX = 120;
export const NOTE_MAX = 500;

/** Trimmed, and empty after trimming counts as missing — a title of three
 *  spaces is not a title. */
const title = z.string().trim().min(1, "A title is required.").max(TITLE_MAX);
const note = z.string().trim().max(NOTE_MAX).transform((v) => (v === "" ? null : v));

export const createItemSchema = z.object({
  title,
  note: note.optional(),
});

/** Every field optional, at least one present: a PATCH that changes nothing
 *  is a client bug worth hearing about, not a silent success. */
export const updateItemSchema = z
  .object({ title, note: note.nullable(), done: z.boolean() })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Nothing to update.");

/** The columns a list needs. Selecting them explicitly keeps the page payload
 *  from growing every time a column is added for some other screen. */
export const ITEM_SELECT = {
  id: true,
  title: true,
  note: true,
  done: true,
  createdAt: true,
} satisfies Prisma.ItemSelect;

export type ListItem = Prisma.ItemGetPayload<{ select: typeof ITEM_SELECT }>;

/** A route id from the URL: a positive integer, or null. */
export function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
