"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { DISPLAY_NAME_MAX } from "@/lib/settings-limits";
import { send, writeFailed } from "@/lib/offline";

/** The settings page's example of an editable preference. */
export default function DisplayNameEditor({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(initialName);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    const res = await send("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name }),
    });
    if (!res?.ok) {
      setState("error");
      return;
    }
    const data = (await res.json()) as { displayName: string };
    setSaved(data.displayName);
    setName(data.displayName);
    setState("saved");
    setTimeout(() => setState("idle"), 2000);
  }

  const dirty = name.trim() !== saved;

  return (
    <form onSubmit={save} className="flex flex-wrap gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={DISPLAY_NAME_MAX}
        placeholder="Your name"
        aria-label="Display name"
        className="h-10 min-w-0 flex-1 rounded-xl border border-white/5 bg-surface-2 px-3 text-base text-foreground outline-none placeholder:text-muted focus:border-white/30 sm:text-sm"
      />
      <button
        type="submit"
        disabled={!dirty || state === "saving"}
        className="inline-flex h-10 w-full flex-none items-center justify-center gap-1.5 rounded-xl bg-foreground px-4 text-xs font-medium text-background disabled:opacity-50 sm:w-auto"
      >
        {state === "saved" && <Check className="h-3.5 w-3.5" strokeWidth={2} />}
        {state === "saving" ? "Saving..." : state === "saved" ? "Saved" : "Save"}
      </button>
      {state === "error" && <p className="w-full text-xs text-red-400">{writeFailed("Could not save that.")}</p>}
    </form>
  );
}
