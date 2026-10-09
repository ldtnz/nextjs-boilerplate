"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ListTodo, Plus, Trash2 } from "lucide-react";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import Select from "@/components/Select";
import EmptyState from "@/components/EmptyState";
import { NOTE_MAX, TITLE_MAX, type ListItem } from "@/lib/items";
import { notifyWriteFailed, send } from "@/lib/offline";
import { hasHoverPointer } from "@/lib/pointer";

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "By title" },
] as const;
type Sort = (typeof SORTS)[number]["value"];

/**
 * The example screen: a list that can be added to, ticked off and pruned.
 *
 * Every write is optimistic — the screen changes at once and is put back if
 * the server says no — because waiting on a round trip to tick a box is what
 * makes a web app feel like one. A failure is never silent: it is undone
 * where it happened and said out loud through notifyWriteFailed.
 */
export default function ItemList({ initialItems }: { initialItems: ListItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [sort, setSort] = useState<Sort>("newest");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<ListItem | null>(null);

  const sorted = useMemo(() => {
    const copy = [...items];
    if (sort === "title") return copy.sort((a, b) => a.title.localeCompare(b.title));
    const by = (i: ListItem) => new Date(i.createdAt).getTime();
    return copy.sort((a, b) => (sort === "newest" ? by(b) - by(a) : by(a) - by(b)));
  }, [items, sort]);

  async function toggle(item: ListItem) {
    const done = !item.done;
    setItems((all) => all.map((i) => (i.id === item.id ? { ...i, done } : i)));
    const res = await send(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    if (!res?.ok) {
      setItems((all) => all.map((i) => (i.id === item.id ? { ...i, done: item.done } : i)));
      notifyWriteFailed("Could not save that.");
    }
  }

  async function remove(item: ListItem) {
    setDeleting(null);
    const before = items;
    setItems((all) => all.filter((i) => i.id !== item.id));
    const res = await send(`/api/items/${item.id}`, { method: "DELETE" });
    if (!res?.ok) {
      setItems(before);
      notifyWriteFailed("Could not delete that.");
    }
  }

  const done = items.filter((i) => i.done).length;

  return (
    <>
      {items.length === 0 ? (
        <EmptyState
          icon={<ListTodo className="h-5 w-5" strokeWidth={1.8} />}
          title="Nothing here yet"
          description="This list is the starter's worked example — a model, its routes, a test and this screen. Replace it with the real thing."
          action={
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add the first one
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="flex-1 text-xs text-muted">
              {done} of {items.length} done
            </p>
            <Select value={sort} onChange={(v) => setSort(v as Sort)} options={SORTS} ariaLabel="Sort" className="w-40" />
            <button
              type="button"
              onClick={() => setAdding(true)}
              aria-label="Add item"
              title="Add item"
              className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-surface-2 text-muted transition-colors hover:bg-surface-3 hover:text-foreground"
            >
              <Plus className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>

          <ul className="overflow-hidden rounded-2xl bg-surface">
            {sorted.map((item) => (
              <li key={item.id} className="group flex items-center gap-3 border-t border-white/5 px-4 py-3 first:border-t-0">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={item.done}
                  aria-label={item.done ? `Mark "${item.title}" as not done` : `Mark "${item.title}" as done`}
                  onClick={() => void toggle(item)}
                  className={`flex h-6 w-6 flex-none items-center justify-center rounded-lg border transition-colors ${
                    item.done ? "border-accent-2 bg-accent-2 text-background" : "border-white/15 text-transparent hover:border-white/30"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${item.done ? "text-muted line-through" : ""}`}>{item.title}</p>
                  {item.note && <p className="truncate text-xs text-muted">{item.note}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setDeleting(item)}
                  aria-label={`Delete "${item.title}"`}
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {adding && (
        <AddItemDialog
          onClose={() => setAdding(false)}
          onAdded={(item) => {
            setItems((all) => [item, ...all]);
            setAdding(false);
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this item?"
          description={`"${deleting.title}" will be removed. This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => void remove(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}

function AddItemDialog({ onClose, onAdded }: { onClose: () => void; onAdded: (item: ListItem) => void }) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Focus the field only where a keyboard costs nothing. On a phone it would
  // raise the keyboard over the dialog the moment it opens, and the first
  // touch anywhere else would be spent dismissing it.
  useEffect(() => {
    if (hasHoverPointer()) titleRef.current?.focus();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await send("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, note }),
    });
    const data = (await res?.json().catch(() => null)) as { item?: ListItem; error?: string } | null;
    setSaving(false);
    if (res?.ok && data?.item) onAdded(data.item);
    else setError(data?.error ?? "Could not add that.");
  }

  const fieldClass =
    "w-full rounded-xl bg-surface-2 px-3 py-2.5 text-base text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-white/15 sm:text-sm";

  return (
    <Modal
      title="Add item"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="h-10 flex-1 rounded-2xl bg-surface-2 text-sm font-medium transition-colors hover:bg-surface-3">
            Cancel
          </button>
          <button
            type="submit"
            form="add-item"
            disabled={saving || !title.trim()}
            className="h-10 flex-1 rounded-2xl bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add"}
          </button>
        </>
      }
    >
      {/* text-base below sm: under 16px iOS zooms the page in on focus. */}
      <form id="add-item" onSubmit={submit} className="space-y-3">
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX}
          placeholder="Title"
          className={fieldClass}
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={NOTE_MAX}
          rows={3}
          placeholder="Note (optional)"
          className={`${fieldClass} resize-none`}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>
    </Modal>
  );
}
