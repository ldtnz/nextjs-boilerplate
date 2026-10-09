"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useDialogFocus } from "@/lib/use-dialog-focus";

/**
 * The shell every dialog in the app is built from: the scrim, the glass
 * panel, a title, a close button, Escape and a click outside to dismiss.
 *
 * Through useDialogFocus it also traps the keyboard inside and holds the page
 * still behind it, so a dialog built on this cannot forget either.
 *
 * Render it only after hydration — from a click, or behind a `mounted` flag —
 * since it portals to document.body, which the server does not have.
 */
export default function Modal({
  title,
  onClose,
  children,
  footer,
  width = "w-[min(92vw,28rem)]",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Pinned under the scrolling body, so the primary action stays reachable
   *  however long the content is. */
  footer?: ReactNode;
  /** Width only; everything else about the panel is fixed here. */
  width?: string;
}) {
  const dialogRef = useDialogFocus<HTMLDivElement>();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="app-modal-overlay overlay-in fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`app-modal-panel dialog-in flex max-h-[85dvh] flex-col overflow-hidden rounded-3xl ${width}`}
      >
        <div className="flex items-center justify-between gap-3 p-5 pb-3">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <div className="flex flex-none gap-2 border-t border-white/5 p-5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
