import type { Quest, ReorderPayload } from "./types";

export function applyReorder(
  quests: Quest[],
  groups: ReorderPayload[],
): Quest[] {
  const map = new Map(quests.map((q) => [q.id, q]));
  for (const group of groups) {
    group.ids.forEach((id, position) => {
      const quest = map.get(id);
      if (!quest) return;
      if (quest.status === group.status && quest.position === position) return;
      map.set(id, { ...quest, status: group.status, position });
    });
  }
  return [...map.values()];
}
