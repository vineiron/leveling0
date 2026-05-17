type Props = {
  lines?: number;
};

export function SkeletonCard({ lines = 2 }: Props) {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-xl border border-border bg-elevated p-3 shadow-xs"
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 h-4 w-4 shrink-0 rounded-md bg-surface-2" />
        <div className="flex-1 space-y-2.5">
          <div className="h-3.5 w-3/4 rounded-md bg-surface-2" />
          {lines > 1 && <div className="h-3.5 w-1/2 rounded-md bg-surface-2" />}
          <div className="flex gap-1.5 pt-0.5">
            <div className="h-4 w-16 rounded-md bg-surface-2" />
            <div className="h-4 w-12 rounded-full bg-surface-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
