import Link from "next/link";
import { Settings } from "lucide-react";
import PageHeader, { iconButtonClass } from "@/components/PageHeader";
import ItemList from "@/components/ItemList";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ITEM_SELECT } from "@/lib/items";
import { APP_NAME } from "@/lib/app";

// Read on every request: the data changes with every write.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [items, settings] = await Promise.all([
    prisma.item.findMany({ select: ITEM_SELECT, orderBy: { createdAt: "desc" } }),
    getSettings(),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl px-3 pb-16 sm:px-5">
      <PageHeader
        title={APP_NAME}
        subtitle={settings.displayName ? `Hello, ${settings.displayName}` : "A starting point."}
        actions={
          <Link href="/settings" aria-label="Settings" title="Settings" className={iconButtonClass}>
            <Settings className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        }
      />
      <ItemList initialItems={items} />
    </main>
  );
}
