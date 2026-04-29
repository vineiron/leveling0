"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Item, ItemDraft, ItemStatus } from "@/lib/items/types";
import { ITEM_STATUSES, STATUS_LABELS } from "@/lib/items/types";
import { DueDateField } from "./DueDateField";
import { MarkdownField } from "./MarkdownField";
import { Modal } from "./Modal";
import { Spinner } from "./Spinner";
import { TagsInput } from "./TagsInput";

const DRAFT_KEY_PREFIX = "leveling0:draft:";

type StoredDraft = {
  title: string;
  status: ItemStatus;
  dueAt: string | null;
  tags: string[];
  detail: string;
  note: string;
  savedAt: number;
};

function readDraft(key: string): StoredDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || typeof d !== "object") return null;
    return d as StoredDraft;
  } catch {
    return null;
  }
}

function clearDraft(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function relativeAgo(ts: number): string {
  const diff = Math.round((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.round(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)} h ago`;
  return `${Math.round(diff / 86400)} d ago`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  initial: Item | null;
  defaultStatus: ItemStatus;
  defaultTags?: string[];
  allTags?: string[];
  onSubmit: (draft: ItemDraft) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function ItemModal({
  open,
  onClose,
  initial,
  defaultStatus,
  defaultTags = [],
  allTags = [],
  onSubmit,
  onDelete,
}: Props) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<ItemStatus>(defaultStatus);
  const [dueAt, setDueAt] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [detail, setDetail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [restoredAt, setRestoredAt] = useState<number | null>(null);

  const draftKey = useMemo(
    () => `${DRAFT_KEY_PREFIX}${initial ? `edit:${initial.id}` : "new"}`,
    [initial],
  );

  const baseValues = useMemo(
    () => ({
      title: initial?.title ?? "",
      status: initial?.status ?? defaultStatus,
      dueAt: initial?.dueAt ?? null,
      tags: initial?.tags ?? defaultTags,
      detail: initial?.detail ?? "",
      note: initial?.note ?? "",
    }),
    [initial, defaultStatus, defaultTags],
  );

  function applyValues(v: typeof baseValues) {
    setTitle(v.title);
    setStatus(v.status);
    setDueAt(v.dueAt);
    setTags(v.tags);
    setDetail(v.detail);
    setNote(v.note);
  }

  // Skip first debounced save when we just opened/restored — it would just rewrite identical data.
  const skipNextSaveRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const draft = readDraft(draftKey);
    const baseSerialized = JSON.stringify(baseValues);
    const draftSerialized = draft
      ? JSON.stringify({
          title: draft.title ?? "",
          status: draft.status ?? baseValues.status,
          dueAt: draft.dueAt ?? null,
          tags: Array.isArray(draft.tags) ? draft.tags : [],
          detail: draft.detail ?? "",
          note: draft.note ?? "",
        })
      : null;

    if (draft && draftSerialized && draftSerialized !== baseSerialized) {
      applyValues({
        title: draft.title ?? "",
        status: ITEM_STATUSES.includes(draft.status) ? draft.status : baseValues.status,
        dueAt: draft.dueAt ?? null,
        tags: Array.isArray(draft.tags) ? draft.tags : [],
        detail: draft.detail ?? "",
        note: draft.note ?? "",
      });
      setRestoredAt(typeof draft.savedAt === "number" ? draft.savedAt : Date.now());
    } else {
      applyValues(baseValues);
      setRestoredAt(null);
      // Stale/matching draft? Clear so it doesn't linger.
      if (draft) clearDraft(draftKey);
    }

    skipNextSaveRef.current = true;
    setError(null);
    setConfirmDeleteOpen(false);
  }, [open, draftKey, baseValues]);

  // Debounced auto-save while modal is open and form differs from base.
  useEffect(() => {
    if (!open) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    const current = { title, status, dueAt, tags, detail, note };
    const dirty = JSON.stringify(current) !== JSON.stringify(baseValues);
    if (!dirty) {
      clearDraft(draftKey);
      setRestoredAt(null);
      return;
    }
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(
          draftKey,
          JSON.stringify({ ...current, savedAt: Date.now() }),
        );
      } catch {
        // ignore quota/serialization errors
      }
    }, 400);
    return () => clearTimeout(t);
  }, [open, draftKey, baseValues, title, status, dueAt, tags, detail, note]);

  function discardDraft() {
    clearDraft(draftKey);
    applyValues(baseValues);
    setRestoredAt(null);
    skipNextSaveRef.current = true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!ITEM_STATUSES.includes(status)) {
      setError("Status is required");
      return;
    }
    if (!detail.trim()) {
      setError("Detail is required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        status,
        dueAt,
        tags,
        detail,
        note,
      });
      clearDraft(draftKey);
      setRestoredAt(null);
      if (!initial) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmDelete() {
    if (!onDelete) return;
    setBusy(true);
    try {
      await onDelete();
      clearDraft(draftKey);
      setRestoredAt(null);
      setConfirmDeleteOpen(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit item" : "New item"}
      widthClass="max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {restoredAt !== null && (
          <div className="flex items-center justify-between gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <span>
              Restored auto-saved draft from {relativeAgo(restoredAt)}.
            </span>
            <button
              type="button"
              onClick={discardDraft}
              className="font-medium underline-offset-2 hover:underline"
            >
              Discard draft
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">
                Title <span className="text-red-600 dark:text-red-400">*</span>
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">
                  Status <span className="text-red-600 dark:text-red-400">*</span>
                </span>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ItemStatus)}
                    className="w-full appearance-none rounded-md border border-zinc-300 bg-white px-3 py-2 pr-9 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  >
                    {ITEM_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </label>
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">Due date & time</span>
                <DueDateField value={dueAt} onChange={setDueAt} />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">Tags</span>
              <TagsInput value={tags} onChange={setTags} suggestions={allTags} />
            </div>

            <MarkdownField label="Note" value={note} onChange={setNote} rows={13} />
          </div>

          <div className="flex h-[24rem] flex-col overflow-hidden lg:h-[60vh]">
            <MarkdownField
              label="Detail *"
              value={detail}
              onChange={setDetail}
              fillHeight
              required
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="mt-2 flex items-center justify-between gap-2">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={busy}
                className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {busy && <Spinner className="h-3.5 w-3.5" />}
              {busy ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>

      <Modal
        open={confirmDeleteOpen}
        onClose={() => {
          if (!busy) setConfirmDeleteOpen(false);
        }}
        title="Delete item?"
        widthClass="max-w-sm"
        hideHeaderBorder
      >
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          This will permanently delete <span className="font-medium">{initial?.title || "this item"}</span>. This action can't be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(false)}
            disabled={busy}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy && <Spinner className="h-3.5 w-3.5" />}
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Modal>
    </Modal>
  );
}
