/** Shown while a page's server data loads: quiet, centred, and short-lived. */
export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="h-10 w-10 animate-pulse rounded-2xl bg-surface-2" />
    </div>
  );
}
