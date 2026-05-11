type Props = {
  lines?: number;
};

export function SkeletonCard({ lines = 2 }: Props) {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 h-4 w-4 shrink-0 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
          {lines > 1 && <div className="h-3 w-1/2 rounded bg-zinc-200/80 dark:bg-zinc-800/80" />}
          <div className="flex gap-1 pt-1">
            <div className="h-3 w-10 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80" />
            <div className="h-3 w-14 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
