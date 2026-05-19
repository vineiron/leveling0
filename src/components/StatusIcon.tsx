import type { QuestStatus } from "@/lib/quests/types";

const COLOR: Record<QuestStatus, string> = {
  backlog: "text-quest-log",
  in_progress: "text-quest-pursuit",
  done: "text-quest-conquered",
};

type Props = {
  status: QuestStatus;
  className?: string;
};

/**
 * Status glyph: scroll (Quest Log), crossed swords (In Pursuit),
 * star (Conquered). Single-color via `currentColor`.
 *
 * All three are Lucide icons (lucide.dev, ISC) on their native 24-grid
 * so the designed geometry and padding stay consistent. The star is
 * filled (rather than Lucide's default outline) so the completed state
 * keeps the heaviest visual weight in the progression.
 */
export function StatusIcon({ status, className = "h-3.5 w-3.5" }: Props) {
  const cls = `${className} shrink-0 ${COLOR[status]}`;

  return (
    <svg
      className={cls}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {status === "backlog" && (
        <>
          <path d="M15 12h-5" />
          <path d="M15 8h-5" />
          <path d="M19 17V5a2 2 0 0 0-2-2H4" />
          <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
        </>
      )}
      {status === "in_progress" && (
        <>
          <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
          <line x1="13" x2="19" y1="19" y2="13" />
          <line x1="16" x2="20" y1="16" y2="20" />
          <line x1="19" x2="21" y1="21" y2="19" />
          <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
          <line x1="5" x2="9" y1="14" y2="18" />
          <line x1="7" x2="4" y1="17" y2="20" />
          <line x1="3" x2="5" y1="19" y2="21" />
        </>
      )}
      {status === "done" && (
        <path
          fill="currentColor"
          stroke="none"
          d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
        />
      )}
    </svg>
  );
}
