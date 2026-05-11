import { Spinner } from "./Spinner";

export function SyncingPill() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 right-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/90 px-3 py-1 text-xs text-zinc-600 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-300"
    >
      <Spinner className="h-3 w-3" label="Syncing" />
      <span>Syncing…</span>
    </div>
  );
}
