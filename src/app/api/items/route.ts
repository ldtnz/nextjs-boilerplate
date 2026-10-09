import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createItemSchema, ITEM_SELECT } from "@/lib/items";

// Never cached: the list changes with every write and must be read fresh.
export const dynamic = "force-dynamic";

/*
 * There is no authentication in the starter, so these routes answer anyone who
 * can reach the deployment. Put the session check at the top of every handler
 * before this goes anywhere public — see "Authentication" in AGENTS.md.
 */

export async function GET() {
  const items = await prisma.item.findMany({ select: ITEM_SELECT, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid item." }, { status: 400 });
  }

  const item = await prisma.item.create({ data: parsed.data, select: ITEM_SELECT });
  return NextResponse.json({ item }, { status: 201 });
}
