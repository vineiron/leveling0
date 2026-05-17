"use client";

import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Modal } from "@/components/Modal";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Spinner } from "@/components/Spinner";
import { StatusIcon } from "@/components/StatusIcon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { btn, chip, field, pill, segment } from "@/components/ui";

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-border py-8">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-fg">{title}</h2>
        {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Swatch({ token, className }: { token: string; className: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`h-14 rounded-lg border border-border ${className}`} />
      <code className="text-[11px] text-muted">{token}</code>
    </div>
  );
}

const SURFACES = [
  ["bg-canvas", "bg-canvas"],
  ["bg-surface", "bg-surface"],
  ["bg-surface-2", "bg-surface-2"],
  ["bg-elevated", "bg-elevated"],
];

const ACCENT = [
  ["bg-accent", "bg-accent"],
  ["bg-accent-hover", "bg-accent-hover"],
  ["bg-accent-subtle", "bg-accent-subtle"],
  ["border-accent-border", "border-2 border-accent-border bg-elevated"],
];
const DANGER = [
  ["bg-danger", "bg-danger"],
  ["bg-danger-hover", "bg-danger-hover"],
  ["bg-danger-subtle", "bg-danger-subtle"],
  ["border-danger-border", "border-2 border-danger-border bg-elevated"],
];
const SUCCESS = [
  ["bg-success", "bg-success"],
  ["bg-success-subtle", "bg-success-subtle"],
  ["border-success-border", "border-2 border-success-border bg-elevated"],
];
const SUPPORT = [
  ["bg-progress", "bg-progress"],
  ["bg-warning-subtle", "bg-warning-subtle"],
  ["border-warning-border", "border-2 border-warning-border bg-elevated"],
  ["bg-scrim", "bg-scrim"],
];

const RADII = ["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full"];
const SHADOWS = ["shadow-xs", "shadow-sm", "shadow-md", "shadow-lg", "shadow-xl"];
const TYPE = [
  ["text-[10px]", "micro labels"],
  ["text-[11px]", "meta / chips"],
  ["text-xs", "secondary"],
  ["text-[13px]", "card & column titles"],
  ["text-sm", "body / controls"],
  ["text-[15px]", "modal title / brand"],
  ["text-base", "section heading"],
  ["text-lg", "large heading"],
];

export default function DesignSystemPage() {
  const [seg, setSeg] = useState<"edit" | "preview">("edit");
  const [modalOpen, setModalOpen] = useState(false);
  const [replay, setReplay] = useState(0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1100px] px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandMark />
          <span className="h-5 w-px bg-border" />
          <h1 className="text-[15px] font-semibold tracking-tight text-fg">Design System</h1>
        </div>
        <ThemeToggle />
      </header>
      <p className="mt-2 text-sm text-muted">
        Single source of truth: <code className="text-fg">src/components/ui.ts</code> (recipes) +{" "}
        <code className="text-fg">src/app/globals.css</code> (semantic tokens). This page is built
        only from them.
      </p>

      <Section title="Color — surfaces" hint="Backgrounds, low → high elevation.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SURFACES.map(([t, c]) => (
            <Swatch key={t} token={t} className={c} />
          ))}
        </div>
      </Section>

      <Section title="Color — text & borders">
        <div className="flex flex-wrap items-end gap-6">
          <p className="text-2xl font-semibold text-fg">
            fg <span className="text-base font-normal">text-fg</span>
          </p>
          <p className="text-2xl font-semibold text-muted">
            muted <span className="text-base font-normal">text-muted</span>
          </p>
          <p className="text-2xl font-semibold text-faint">
            faint <span className="text-base font-normal">text-faint</span>
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="h-12 w-24 rounded-lg border border-border bg-elevated" />
            <code className="text-[11px] text-muted">border-border</code>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-12 w-24 rounded-lg border border-border-strong bg-elevated" />
            <code className="text-[11px] text-muted">border-border-strong</code>
          </div>
        </div>
      </Section>

      <Section
        title="Color — semantic"
        hint="Accent (ember) = brand/primary/selection only. Danger = destructive/overdue. Success = done. Progress = in-progress dot. Warning = drafts / due-soon."
      >
        <div className="flex flex-col gap-5">
          {[
            ["Accent", ACCENT],
            ["Danger", DANGER],
            ["Success", SUCCESS],
            ["Support (progress / warning / scrim)", SUPPORT],
          ].map(([label, set]) => (
            <div key={label as string} className="flex flex-col gap-2">
              <div className="text-xs font-medium text-muted">{label as string}</div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {(set as string[][]).map(([t, c]) => (
                  <Swatch key={t} token={t} className={c} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Radius" hint="By role: chips/icons → md · controls → lg · cards/modals → xl · columns → 2xl · status pills → full.">
        <div className="flex flex-wrap gap-5">
          {RADII.map((r) => (
            <div key={r} className="flex flex-col items-center gap-1.5">
              <div className={`h-16 w-16 bg-accent-subtle ${r}`} />
              <code className="text-[11px] text-muted">{r}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Elevation" hint="Theme-swapped shadow scale.">
        <div className="flex flex-wrap gap-6">
          {SHADOWS.map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={`h-16 w-24 rounded-lg bg-elevated ${s}`} />
              <code className="text-[11px] text-muted">{s}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="flex flex-col gap-2">
          {TYPE.map(([cls, use]) => (
            <div key={cls} className="flex items-baseline gap-4">
              <span className={`${cls} font-medium text-fg`}>The quick brown fox</span>
              <code className="text-[11px] text-muted">
                {cls} — {use}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Motion" hint="Entrance animations + the looping scroll-hint nudge. prefers-reduced-motion neutralizes all.">
        <div className="flex flex-col gap-4">
          <button type="button" onClick={() => setReplay((n) => n + 1)} className={btn.secondary}>
            Replay
          </button>
          <div key={replay} className="flex flex-wrap gap-4">
            {["animate-fade-in", "animate-pop-in", "animate-panel-in", "animate-overlay-in"].map(
              (a) => (
                <div
                  key={a}
                  className={`flex h-16 w-40 items-center justify-center rounded-lg bg-surface text-xs text-muted ${a}`}
                >
                  {a}
                </div>
              ),
            )}
          </div>
          <div className="flex items-center gap-2 text-faint">
            <svg className="h-4 w-4 animate-hint-up" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.22 12.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0l4.25 4.25a.75.75 0 11-1.06 1.06L10 8.56l-3.72 3.72a.75.75 0 01-1.06 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">animate-hint-up / -down (looping)</span>
            <svg className="h-4 w-4 animate-hint-down" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </Section>

      <Section title="Buttons" hint="ui.ts btn.* — standard scale h-9 / px-3 / rounded-lg.">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={btn.primary}>
            Primary
          </button>
          <button type="button" className={btn.secondary}>
            Secondary
          </button>
          <button type="button" className={btn.danger}>
            Danger
          </button>
          <button type="button" className={btn.dangerSolid}>
            Danger solid
          </button>
          <button type="button" aria-label="icon" className={btn.ghostIcon}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z" />
            </svg>
          </button>
          <button type="button" disabled className={btn.primary}>
            Disabled
          </button>
          <button type="button" className={btn.primary}>
            <Spinner className="h-3.5 w-3.5" /> Loading
          </button>
        </div>
      </Section>

      <Section title="Fields" hint="ui.ts field — one input/textarea/select base + canonical focus ring.">
        <div className="grid max-w-xl gap-3">
          <input className={`w-full ${field}`} placeholder="Text input" />
          <div className="relative">
            <select className={`w-full appearance-none pr-9 ${field}`}>
              <option>Select…</option>
              <option>Backlog</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <textarea className={`w-full ${field}`} rows={3} placeholder="Textarea" />
        </div>
      </Section>

      <Section title="Segmented control" hint="Active = raised neutral (bg-elevated / shadow-sm), never accent. ThemeToggle uses iconItem.">
        <div className="flex flex-wrap items-center gap-6">
          <div role="tablist" className={segment.wrap}>
            <button
              type="button"
              role="tab"
              aria-selected={seg === "edit"}
              onClick={() => setSeg("edit")}
              className={segment.item(seg === "edit")}
            >
              Edit
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={seg === "preview"}
              onClick={() => setSeg("preview")}
              className={segment.item(seg === "preview")}
            >
              Preview
            </button>
          </div>
          <ThemeToggle />
        </div>
      </Section>

      <Section title="Chips, pills & status" hint="chip (data, rounded-md) vs pill (status/identity, rounded-full).">
        <div className="flex flex-wrap items-center gap-3">
          <span className={chip}>
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18h-10.5A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM3.5 9.5v5.75c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V9.5h-13z" />
            </svg>
            May 16, 1:00 PM
          </span>
          <span className={`${chip} bg-warning-subtle text-warning-text`}>due soon</span>
          <span className={`${chip} bg-danger-subtle text-danger-text`}>overdue</span>
          <span className={chip}>kocka</span>
          <span className={pill}>
            <span className="h-1.5 w-1.5 rounded-full bg-accent-text" /> Synced
          </span>
          <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted">
            12
          </span>
          <span className="flex items-center gap-2 text-sm text-fg">
            <StatusIcon status="backlog" /> Backlog
          </span>
          <span className="flex items-center gap-2 text-sm text-fg">
            <StatusIcon status="in_progress" /> In Progress
          </span>
          <span className="flex items-center gap-2 text-sm text-fg">
            <StatusIcon status="done" /> Done
          </span>
        </div>
      </Section>

      <Section title="Surfaces & components">
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-64 rounded-xl bg-elevated p-3 shadow-xs">
            <div className="text-[13px] font-medium text-fg">Card sample</div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className={chip}>kocka</span>
              <span className={chip}>asdad</span>
            </div>
          </div>
          <div className="w-64">
            <SkeletonCard />
          </div>
          <div
            role="status"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated/90 px-3 py-1.5 text-xs font-medium text-muted shadow-md"
          >
            <Spinner className="h-3 w-3 text-accent-text" /> Syncing…
          </div>
          <button type="button" onClick={() => setModalOpen(true)} className={btn.secondary}>
            Open modal
          </button>
        </div>
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal"
        widthClass="max-w-md"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className={btn.secondary}>
              Cancel
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className={btn.primary}>
              Confirm
            </button>
          </div>
        }
      >
        <p className="text-sm text-muted">
          Scrim + blur, panel-in motion, pinned header/footer, stack-aware (ref-counted scroll lock,
          top-most Esc).
        </p>
      </Modal>

      <footer className="border-t border-border py-8 text-xs text-faint">
        leveling0 design system · edit recipes in src/components/ui.ts · tokens in
        src/app/globals.css
      </footer>
    </main>
  );
}
