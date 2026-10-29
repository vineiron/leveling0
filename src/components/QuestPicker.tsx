"use client";

import { useState } from "react";
import {
  QUEST_STATUSES,
  type Quest,
  type QuestStatus,
  STATUS_LABELS,
} from "@/lib/quests/types";
import { StatusIcon } from "./StatusIcon";
import { chip, segment } from "./ui";

type Props = {
  quests: Quest[];
  picked: Set<string>;
  onPickedChange: (next: Set<string>) => void;
  blockedLabel?: (quest: Quest) => string | null;
  disabled?: boolean;
};

export function QuestPicker({
  quests,
  picked,
  onPickedChange,
  blockedLabel = () => null,
  disabled = false,
}: Props) {
  const columns = QUEST_STATUSES.map((status) => {
    const all = quests
      .filter((q) => q.status === status)
      .sort((a, b) => a.position - b.position);
    const open = all.filter((q) => blockedLabel(q) === null);
    const on = open.filter((q) => picked.has(q.id)).length;
    return { status, all, open, on };
  });
  const [tab, setTab] = useState<QuestStatus>(
    () =>
      (columns.find((c) => c.on > 0) ?? columns.find((c) => c.all.length > 0))
        ?.status ?? QUEST_STATUSES[0],
  );

  function setPicked(ids: string[], on: boolean) {
    const next = new Set(picked);
    for (const id of ids) {
      if (on) next.add(id);
      else next.delete(id);
    }
    onPickedChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" className={`${segment.wrap} flex w-full md:hidden`}>
        {columns.map((c) => (
          <button
            key={c.status}
            type="button"
            role="tab"
            aria-selected={c.status === tab}
            onClick={() => setTab(c.status)}
            className={`${segment.item(c.status === tab)} flex min-w-0 flex-1 items-center justify-center gap-1.5`}
          >
            <StatusIcon status={c.status} className="h-3 w-3" />
            <span className="truncate">{STATUS_LABELS[c.status]}</span>
            <span className="text-faint">{c.on}</span>
          </button>
        ))}
      </div>

      <div className="md:grid md:grid-cols-3 md:gap-3">
        {columns.map((c) => (
          <section
            key={c.status}
            aria-label={STATUS_LABELS[c.status]}
            className={`${c.status === tab ? "flex" : "hidden"} min-w-0 flex-col gap-1 rounded-xl bg-surface p-2 md:flex`}
          >
            <label className="flex items-center gap-2 px-2 py-1.5 text-[13px] font-semibold text-fg">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 accent-accent"
                checked={c.open.length > 0 && c.on === c.open.length}
                ref={(el) => {
                  if (el) el.indeterminate = c.on > 0 && c.on < c.open.length;
                }}
                onChange={(e) =>
                  setPicked(
                    c.open.map((q) => q.id),
                    e.target.checked,
                  )
                }
                disabled={disabled || c.open.length === 0}
              />
              <StatusIcon status={c.status} className="h-3.5 w-3.5" />
              <span className="truncate">{STATUS_LABELS[c.status]}</span>
              <span className="ml-auto text-xs font-medium text-muted">
                {c.on}/{c.open.length}
              </span>
            </label>

            {c.all.length === 0 ? (
              <p className="px-2 pb-2 text-xs text-faint">Nothing here</p>
            ) : (
              <ul className="flex flex-col md:max-h-[min(50dvh,26rem)] md:overflow-y-auto md:overscroll-contain">
                {c.all.map((q) => {
                  const blocked = blockedLabel(q);
                  const on = blocked === null && picked.has(q.id);
                  return (
                    <li key={q.id}>
                      <label
                        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors ${
                          blocked === null ? "hover:bg-surface-2" : "opacity-60"
                        } ${on ? "text-fg" : "text-muted"}`}
                      >
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 shrink-0 accent-accent"
                          checked={on}
                          onChange={(e) => setPicked([q.id], e.target.checked)}
                          disabled={disabled || blocked !== null}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {q.title}
                        </span>
                        {blocked !== null ? (
                          <span className={chip}>{blocked}</span>
                        ) : (
                          q.tags[0] && (
                            <span className={`${chip} max-w-24`}>
                              <span className="truncate">{q.tags[0]}</span>
                            </span>
                          )
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
