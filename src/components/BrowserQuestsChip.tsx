import { questCount } from "@/lib/quests/format";

type Props = {
  count: number;
  onClick: () => void;
  className?: string;
};

export function BrowserQuestsChip({
  count,
  onClick,
  className = "inline-flex",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tap-target ${className} items-center gap-1 whitespace-nowrap rounded-full border border-accent-border bg-accent-subtle px-2 py-0.5 text-[11px] font-medium text-accent-text transition-colors hover:border-accent`}
      title={`${questCount(count)} saved in this browser only. Bring ${count === 1 ? "it" : "them"} into your account.`}
    >
      <svg
        className="h-3 w-3"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
          clipRule="evenodd"
        />
      </svg>
      {count} in this browser
    </button>
  );
}
