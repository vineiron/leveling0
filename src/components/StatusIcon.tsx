import type { ItemStatus } from "@/lib/items/types";

const COLOR: Record<ItemStatus, string> = {
  backlog: "text-faint",
  in_progress: "text-progress",
  done: "text-success",
};

type Props = {
  status: ItemStatus;
  className?: string;
};

/**
 * Status glyph: hollow ring (backlog), quarter-filled circle (in progress),
 * solid disc (done). Single-color via `currentColor`.
 */
export function StatusIcon({ status, className = "h-3.5 w-3.5" }: Props) {
  return (
    <svg
      className={`${className} shrink-0 ${COLOR[status]}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {status === "done" ? (
        <circle cx="8" cy="8" r="7" fill="currentColor" />
      ) : (
        <>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
          {status === "in_progress" && (
            <path d="M8 8V3a5 5 0 0 1 5 5Z" fill="currentColor" />
          )}
        </>
      )}
    </svg>
  );
}
