/**
 * leveling0 design system — single source of truth for component recipes.
 *
 * Components compose these instead of hand-writing Tailwind so the visual
 * language can't drift. Colors/radii/shadows come from the semantic tokens
 * in globals.css; this file is the *component-level* canon.
 *
 * Scale: standard control = h-9 / px-3 / rounded-lg / text-sm.
 * Accent (ember) is reserved for primary actions, data-selection, links and
 * focus — never for view toggles or chrome.
 */

/** Buttons. `disabled:opacity-50` baked in. */
export const btn = {
  primary:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-medium text-accent-fg shadow-sm transition-all duration-150 ease-[cubic-bezier(.2,.9,.25,1)] hover:bg-accent-hover hover:shadow-[0_2px_14px_var(--accent-glow)] active:scale-[.97] disabled:opacity-50",
  secondary:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-fg transition-colors hover:bg-surface disabled:opacity-50",
  danger:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-danger-border px-3 text-sm font-medium text-danger-text transition-colors hover:bg-danger-subtle disabled:opacity-50",
  dangerSolid:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-danger px-3 text-sm font-medium text-danger-fg transition-colors hover:bg-danger-hover disabled:opacity-50",
  /** Square icon-only button at standard control height. */
  ghostIcon:
    "inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-fg disabled:opacity-50",
};

/** Text input / textarea / select base. Append layout/element extras after. */
export const field =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-accent focus:bg-elevated focus:ring-2 focus:ring-ring";

/** Segmented control (view toggles). Active = raised neutral, never accent. */
export const segment = {
  wrap: "inline-flex shrink-0 gap-0.5 rounded-lg border border-border bg-surface p-0.5",
  item: (active: boolean) =>
    `rounded-md px-2 py-1 text-xs font-medium transition-colors ${
      active ? "bg-elevated text-fg shadow-sm" : "text-muted hover:text-fg"
    }`,
  iconItem: (active: boolean) =>
    `flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
      active ? "bg-elevated text-fg shadow-sm" : "text-faint hover:text-fg"
    }`,
};

/** Data-attribute chip (tags, due) — slightly rounded. Override bg/text for state. */
export const chip =
  "inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 text-[11px] font-medium text-muted";

/** Status/identity pill — fully round (mode, etc.). */
export const pill =
  "inline-flex items-center gap-1.5 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-muted";
