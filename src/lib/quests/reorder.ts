import type { Quest, ReorderPayload } from "./types";

// Applies board reorder groups to a quest list. Each group is the full ordered
// id list for one column; a quest's new status and position come from the
// group it appears in. Quests not mentioned in any group are left untouched.
// Only quests whose status or position actually changed get a new object, and
// they are stamped with `now` when one is given (persistence), otherwise left
// as-is (optimistic preview).
export function applyReorder(
  quests: Quest[],
  groups: ReorderPayload[],
  now?: string,
): Quest[] {
  const map = new Map(quests.map((q) => [q.id, q]));
  for (const group of groups) {
    group.ids.forEach((id, position) => {
      const quest = map.get(id);
      if (!quest) return;
      if (quest.status === group.status && quest.position === position) return;
      map.set(id, {
        ...quest,
        status: group.status,
        position,
        ...(now ? { updatedAt: now } : {}),
      });
    });
  }
  return [...map.values()];
}
