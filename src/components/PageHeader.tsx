import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The bar at the top of every page: a title, an optional line under it, and
 * the page's actions on the right.
 *
 * Sticky with a blurred, mostly opaque background, so content scrolling under
 * it stays legible behind it without competing. The top padding includes the
 * safe area, since the installed app draws under the status bar.
 */
export default function PageHeader({
  title,
  subtitle,
  back,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  /** Where the back link goes; omitted on the home page. */
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 -mx-3 mb-4 bg-background/95 px-3 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-5 sm:px-5">
      {back && (
        <Link href={back.href} className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          {back.label}
        </Link>
      )}
      <div className="flex min-h-9 items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-none items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/** The square icon button the header's actions are made of. */
export const iconButtonClass =
  "flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-foreground";
