import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="app-modal-panel flex w-[min(90vw,380px)] flex-col gap-6 rounded-3xl p-8 text-center sm:p-10">
        <div>
          <p className="font-mono text-xs text-muted">404</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Nothing lives here.</h1>
          <p className="mt-1.5 text-xs text-muted">The address may be old, or mistyped.</p>
        </div>
        <Link href="/" className="rounded-2xl bg-foreground py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90">
          Back to the start
        </Link>
      </div>
    </div>
  );
}
