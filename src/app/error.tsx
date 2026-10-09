"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

/**
 * What a crash looks like.
 *
 * Without a boundary, production shows Next's bare "Application error: a
 * client-side exception has occurred" — no styling, no explanation, and no way
 * back other than retyping the address. This offers the two ways out.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // The browser console is the only log a self-hosted instance has; on
    // Vercel this also reaches the function logs.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="app-modal-panel flex w-[min(90vw,380px)] flex-col gap-8 rounded-3xl p-8 sm:p-10">
        <div className="space-y-3">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight">Something went wrong.</h1>
          <p className="text-sm leading-snug text-foreground/65">The page stopped where it was. Your data is untouched.</p>
          {error.digest && <p className="font-mono text-[10px] text-muted/70">Reference: {error.digest}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={reset}
            className="flex items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2} />
            Try again
          </button>
          {/* A plain anchor, not <Link>: when the crash happened on "/" itself a
              client-side navigation to "/" changes nothing and the boundary
              stays put. A full load starts the page over. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- see above */}
          <a href="/" className="flex items-center justify-center rounded-xl bg-surface-2 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-3">
            Back to the start
          </a>
        </div>
      </div>
    </div>
  );
}
