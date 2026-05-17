"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { dueState } from "@/lib/items/due";
import type { ItemStatus } from "@/lib/items/types";

type Props = {
  value: string | null; // ISO string
  status: ItemStatus;
  onChange: (iso: string | null) => void;
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function formatRelative(d: Date): string {
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(diffMs) < 60_000) return "now";
  if (Math.abs(diffMs) < 3_600_000) return rtf.format(Math.round(diffMs / 60_000), "minute");
  if (Math.abs(diffDays) < 1) return rtf.format(Math.round(diffMs / 3_600_000), "hour");
  if (Math.abs(diffDays) < 7) return rtf.format(diffDays, "day");
  if (Math.abs(diffDays) < 30) return rtf.format(Math.round(diffDays / 7), "week");
  return rtf.format(Math.round(diffDays / 30), "month");
}

function formatPretty(d: Date): string {
  const now = new Date();
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (isSameDay(d, now)) return `Today at ${time}`;
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameDay(d, tomorrow)) return `Tomorrow at ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(d, yesterday)) return `Yesterday at ${time}`;
  return `${d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} at ${time}`;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildMonthGrid(viewMonth: Date): Date[] {
  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const startOffset = first.getDay(); // 0 = Sunday
  const start = new Date(first);
  start.setDate(start.getDate() - startOffset);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function DueDateField({ value, status, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const initialDraft = useMemo(() => (value ? new Date(value) : null), [value]);
  const [draftDate, setDraftDate] = useState<Date | null>(initialDraft);
  const [hour, setHour] = useState<number>(initialDraft ? initialDraft.getHours() : 21);
  const [minute, setMinute] = useState<number>(initialDraft ? initialDraft.getMinutes() : 0);
  const [viewMonth, setViewMonth] = useState<Date>(
    new Date((initialDraft ?? new Date()).getFullYear(), (initialDraft ?? new Date()).getMonth(), 1),
  );
  const [pickerMode, setPickerMode] = useState<"days" | "years">("days");

  useEffect(() => {
    if (!open) return;
    const v = value ? new Date(value) : null;
    setDraftDate(v);
    setHour(v ? v.getHours() : 21);
    setMinute(v ? v.getMinutes() : 0);
    setViewMonth(new Date((v ?? new Date()).getFullYear(), (v ?? new Date()).getMonth(), 1));
    setPickerMode("days");
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const date = value ? new Date(value) : null;
  const state = dueState(value, status);
  const overdue = state === "overdue";
  const soon = state === "soon";
  const done = state === "done";
  const grid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const today = startOfDay(new Date());

  function applyDraft() {
    if (!draftDate) return;
    const out = new Date(draftDate);
    out.setHours(hour, minute, 0, 0);
    onChange(out.toISOString());
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative flex flex-col gap-1">
      <div className="flex items-stretch gap-1.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2"
        >
          <svg className="h-4 w-4 text-faint" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18h-10.5A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.75 5.5c-.69 0-1.25.56-1.25 1.25V8h13V6.75c0-.69-.56-1.25-1.25-1.25H4.75zM3.5 9.5v5.75c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V9.5h-13z" />
          </svg>
          {date ? (
            <span className="flex flex-1 flex-col leading-tight">
              <span className="text-fg">{formatPretty(date)}</span>
              <span
                className={`text-[11px] ${
                  overdue
                    ? "text-danger-text"
                    : soon
                      ? "text-warning-text"
                      : "text-faint"
                }`}
              >
                {done
                  ? "Completed"
                  : `${overdue ? "Overdue · " : soon ? "Due soon · " : ""}${formatRelative(date)}`}
              </span>
            </span>
          ) : (
            <span className="flex-1 text-faint">No due date</span>
          )}
        </button>
        {date && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Clear due date"
            title="Clear due date"
            className="inline-flex h-auto w-9 shrink-0 items-center justify-center rounded-lg border border-danger-border bg-surface text-danger-text transition-colors hover:bg-danger-subtle"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1.5 w-[20rem] max-w-[calc(100vw-2rem)] origin-top animate-pop-in overflow-hidden rounded-xl border border-border bg-elevated p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (pickerMode === "days") {
                  setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
                } else {
                  setViewMonth(new Date(viewMonth.getFullYear() - 12, viewMonth.getMonth(), 1));
                }
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface hover:text-fg"
              aria-label={pickerMode === "days" ? "Previous month" : "Previous 12 years"}
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.78 4.22a.75.75 0 010 1.06L8.06 10l4.72 4.72a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setPickerMode((m) => (m === "days" ? "years" : "days"))}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-fg transition-colors hover:bg-surface"
              aria-label="Switch to year picker"
            >
              {pickerMode === "days" ? (
                <>
                  {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                </>
              ) : (
                <>
                  {viewMonth.getFullYear() - 5} – {viewMonth.getFullYear() + 6}
                </>
              )}
              <svg className="h-3 w-3 text-faint" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                if (pickerMode === "days") {
                  setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
                } else {
                  setViewMonth(new Date(viewMonth.getFullYear() + 12, viewMonth.getMonth(), 1));
                }
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface hover:text-fg"
              aria-label={pickerMode === "days" ? "Next month" : "Next 12 years"}
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.22 4.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L11.94 10 7.22 5.28a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {pickerMode === "days" ? (
            <>
              <div className="mb-1 grid grid-cols-7 gap-0.5">
                {WEEKDAYS.map((w) => (
                  <div
                    key={w}
                    className="text-center text-[10px] font-medium uppercase tracking-wide text-faint"
                  >
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {grid.map((day) => {
                  const inMonth = day.getMonth() === viewMonth.getMonth();
                  const isToday = isSameDay(day, today);
                  const isSelected = draftDate && isSameDay(day, draftDate);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => setDraftDate(day)}
                      className={`relative flex h-8 items-center justify-center rounded-md text-xs transition-colors ${
                        isSelected
                          ? "bg-accent font-semibold text-accent-fg"
                          : inMonth
                            ? "text-fg hover:bg-surface"
                            : "text-faint hover:bg-surface"
                      }`}
                    >
                      {day.getDate()}
                      {isToday && !isSelected && (
                        <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-accent-text" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 12 }, (_, i) => viewMonth.getFullYear() - 5 + i).map((y) => {
                const isCurrent = y === new Date().getFullYear();
                const isSelected = y === viewMonth.getFullYear();
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setViewMonth(new Date(y, viewMonth.getMonth(), 1));
                      setPickerMode("days");
                    }}
                    className={`relative flex h-10 items-center justify-center rounded-md text-sm transition-colors ${
                      isSelected
                        ? "bg-accent font-semibold text-accent-fg"
                        : "text-fg hover:bg-surface"
                    }`}
                  >
                    {y}
                    {isCurrent && !isSelected && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent-text" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-faint">
              Time
            </span>
            <div className="flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1">
              <input
                type="number"
                min={0}
                max={23}
                value={String(hour).padStart(2, "0")}
                onChange={(e) => setHour(clamp(parseInt(e.target.value || "0", 10) || 0, 0, 23))}
                className="w-9 bg-transparent text-center text-sm text-fg outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label="Hour (0-23)"
              />
              <span className="text-faint">:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={String(minute).padStart(2, "0")}
                onChange={(e) => setMinute(clamp(parseInt(e.target.value || "0", 10) || 0, 0, 59))}
                className="w-9 bg-transparent text-center text-sm text-fg outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label="Minute (0-59)"
              />
            </div>
            <div className="ml-auto flex gap-1">
              {[
                { label: "9a", h: 9, m: 0 },
                { label: "12p", h: 12, m: 0 },
                { label: "5p", h: 17, m: 0 },
                { label: "9p", h: 21, m: 0 },
              ].map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => {
                    setHour(t.h);
                    setMinute(t.m);
                  }}
                  className="rounded-md bg-surface px-1.5 py-0.5 text-[11px] text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="text-xs text-muted transition-colors hover:text-fg"
            >
              Clear
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyDraft}
                disabled={!draftDate}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
