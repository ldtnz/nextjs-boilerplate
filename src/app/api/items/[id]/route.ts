import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ITEM_SELECT, parseId, updateItemSchema } from "@/lib/items";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const body = await request.json().catch(() => null);
  const parsed = updateItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid update." }, { status: 400 });
  }

  // updateMany, not update: `update` throws P2025 for a missing row, which
  // surfaces as a 500. A count of zero is the same fact, answered as a 404.
  const { count } = await prisma.item.updateMany({ where: { id }, data: parsed.data });
  if (count === 0) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  const item = await prisma.item.findUniqueOrThrow({ where: { id }, select: ITEM_SELECT });
  return NextResponse.json({ item });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const { count } = await prisma.item.deleteMany({ where: { id } });
  if (count === 0) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  return NextResponse.json({ deleted: id });
}
