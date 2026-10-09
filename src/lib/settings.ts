import { prisma } from "@/lib/prisma";

/**
 * The settings row, created on first read.
 *
 * It is a singleton (id fixed to 1) so that nothing has to seed it: the first
 * request on a fresh database makes it with every column at its default, and
 * every request after that finds it.
 */
export async function getSettings() {
  return prisma.settings.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} });
}
