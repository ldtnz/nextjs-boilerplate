import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DISPLAY_NAME_MAX } from "@/lib/settings-limits";

const schema = z.object({ displayName: z.string().trim().max(DISPLAY_NAME_MAX) });

export async function PATCH(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid settings." }, { status: 400 });
  }

  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, ...parsed.data },
    update: parsed.data,
    select: { displayName: true },
  });
  return NextResponse.json(settings);
}
