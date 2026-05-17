"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "@/lib/items/errors";
import type { Item, ItemDraft, ItemStatus } from "@/lib/items/types";
import { ITEM_STATUSES, STATUS_LABELS } from "@/lib/items/types";
import { DueDateField } from "./DueDateField";
import { MarkdownField } from "./MarkdownField";
import { Modal } from "./Modal";
import { Spinner } from "./Spinner";
import { TagsInput } from "./TagsInput";
import { btn, field } from "./ui";

const DRAFT_KEY_PREFIX = "leveling0:draft:";

const FIELD_CLASS = `w-full ${field}`;

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
  const [errors, setErrors] = useState<string[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [restoredAt, setRestoredAt] = useState<number | null>(null);
  // When set, the dialog swaps the whole form for a focused full-height
  // editor of just this field (no second/stacked modal).
  const [focusedField, setFocusedField] = useState<"note" | "detail" | null>(null);

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
    setErrors([]);
    setConfirmDeleteOpen(false);
    setFocusedField(null);
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
      setErrors(["Title is required."]);
      return;
    }
    if (!ITEM_STATUSES.includes(status)) {
      setErrors(["Status is required."]);
      return;
    }
    if (!detail.trim()) {
      setErrors(["Detail is required."]);
      return;
    }
    setBusy(true);
    setErrors([]);
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
      setErrors(
        err instanceof ApiError
          ? err.messages
          : [err instanceof Error ? err.message : String(err)],
      );
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
      setErrors(
        err instanceof ApiError
          ? err.messages
          : [err instanceof Error ? err.message : String(err)],
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={focusedField ? () => setFocusedField(null) : onClose}
      title={
        focusedField === "detail"
          ? "Detail"
          : focusedField === "note"
            ? "Note"
            : initial
              ? "Edit item"
              : "New item"
      }
      widthClass="max-w-5xl"
      heightClass="h-[85vh]"
      hideHeaderBorder
      hideFooterBorder
      hideClose={Boolean(focusedField)}
      footer={
        focusedField ? undefined : (
        <div className="flex items-center justify-between gap-2">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={busy}
                className={btn.danger}
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={btn.secondary}>
              Cancel
            </button>
            <button type="submit" form="item-form" disabled={busy} className={btn.primary}>
              {busy && <Spinner className="h-3.5 w-3.5" />}
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
        )
      }
    >
      {focusedField ? (
        <div className="flex h-[72vh] flex-col">
          <MarkdownField
            label={focusedField === "detail" ? "Detail *" : "Note"}
            value={focusedField === "detail" ? detail : note}
            onChange={focusedField === "detail" ? setDetail : setNote}
            fillHeight
            required={focusedField === "detail"}
            hideLabel
            headerLeft={
              <button
                type="button"
                onClick={() => setFocusedField(null)}
                className="-ml-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-fg"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.78 4.22a.75.75 0 010 1.06L8.06 10l4.72 4.72a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Back
              </button>
            }
          />
        </div>
      ) : (
      <form id="item-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        {restoredAt !== null && (
          <div className="flex flex-col gap-2.5 rounded-lg bg-warning-subtle px-3 py-2.5 text-warning-text sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" />
              </svg>
              <div className="text-xs leading-snug">
                <p className="font-semibold">Draft restored</p>
                <p>Recovered unsaved changes from {relativeAgo(restoredAt)}.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={discardDraft}
              className="w-full shrink-0 rounded-md border border-warning-border bg-elevated px-2.5 py-2.5 text-xs font-medium text-warning-text transition-colors hover:bg-warning-border sm:w-auto sm:self-auto sm:py-1.5"
            >
              Discard draft
            </button>
          </div>
        )}
        {/* On a single (mobile) column the order is Title, Status/Due, Tags,
            Detail, Note — i.e. Detail and Note swapped vs. authoring order so
            the primary Detail field comes first of the two. On lg the original
            two-column layout (meta left, tall Detail right) is rebuilt via
            explicit grid placement. */}
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-4">
          <div className="flex flex-col gap-3.5 lg:col-start-1 lg:row-start-1">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-muted">
                Title <span className="text-danger-text">*</span>
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="What needs to be done?"
                className={FIELD_CLASS}
              />
            </label>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-muted">
                  Status <span className="text-danger-text">*</span>
                </span>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ItemStatus)}
                    className={`w-full appearance-none pr-9 ${FIELD_CLASS}`}
                  >
                    {ITEM_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
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
              <div className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-muted">Due date &amp; time</span>
                <DueDateField value={dueAt} status={status} onChange={setDueAt} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-muted">Tags</span>
              <TagsInput value={tags} onChange={setTags} suggestions={allTags} />
            </div>
          </div>

          <div className="flex h-[24rem] flex-col overflow-hidden lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:h-[60vh]">
            <MarkdownField
              label="Detail *"
              value={detail}
              onChange={setDetail}
              fillHeight
              required
              onExpand={() => setFocusedField("detail")}
            />
          </div>

          <div className="lg:col-start-1 lg:row-start-2 lg:min-h-0">
            <MarkdownField
              label="Note"
              value={note}
              onChange={setNote}
              rows={13}
              onExpand={() => setFocusedField("note")}
            />
          </div>
        </div>

        {errors.length > 0 && (
          <div
            role="alert"
            className="max-h-32 overflow-auto rounded-lg border border-danger-border bg-danger-subtle px-3 py-2.5 text-sm text-danger-text"
          >
            {errors.length === 1 ? (
              <p>{errors[0]}</p>
            ) : (
              <>
                <p className="mb-1 font-medium">Please fix the following:</p>
                <ul className="list-disc space-y-0.5 pl-5">
                  {errors.map((m, i) => (
                    <li key={`${i}-${m}`}>{m}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

      </form>
      )}

      <Modal
        open={confirmDeleteOpen}
        onClose={() => {
          if (!busy) setConfirmDeleteOpen(false);
        }}
        title="Delete item?"
        widthClass="max-w-sm"
        hideHeaderBorder
      >
        <p className="text-sm text-muted">
          This will permanently delete{" "}
          <span className="font-medium text-fg">{initial?.title || "this item"}</span>. This
          action can&apos;t be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(false)}
            disabled={busy}
            className={btn.secondary}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={busy}
            className={btn.dangerSolid}
          >
            {busy && <Spinner className="h-3.5 w-3.5" />}
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Modal>
    </Modal>
  );
}
