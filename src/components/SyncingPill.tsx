import { Spinner } from "./Spinner";

export function SyncingPill() {
  return (
    <output className="fixed bottom-4 right-4 z-40 inline-flex animate-fade-in items-center gap-2 rounded-full border border-border bg-elevated/90 px-3 py-1.5 text-xs font-medium text-muted shadow-md backdrop-blur max-md:bottom-24">
      <Spinner className="h-3 w-3 text-accent-text" />
      <span>Syncing…</span>
    </output>
  );
}
