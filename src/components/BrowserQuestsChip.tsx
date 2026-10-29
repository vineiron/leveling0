import { questCount } from "@/lib/quests/format";

type Props = {
  count: number;
  className?: string;
};

export function BrowserQuestsChip({ count, className = "inline-flex" }: Props) {
  return (
    <span
      className={`${className} items-center gap-1.5 whitespace-nowrap rounded-full border border-accent-border bg-accent-subtle px-2 py-0.5 text-[11px] font-medium text-accent-text`}
      title={`${questCount(count)} saved in this browser only, not in your account. Sign out to see ${count === 1 ? "it" : "them"}.`}
    >
      {count} in this browser
    </span>
  );
}
