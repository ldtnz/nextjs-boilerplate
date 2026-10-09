import type { ReactNode } from "react";

/**
 * Shown in place of a list that has nothing in it, so the first thing an
 * empty screen offers is what to do next rather than a line of grey text.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-white/10 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-muted">{icon}</div>
      <div className="max-w-xs">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
