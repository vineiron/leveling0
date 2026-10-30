export type Placed = { id: string; position: number };

export function planMove(
  column: Placed[],
  movedId: string,
  afterId: string | null,
  beforeId: string | null,
): Placed[] {
  const order = column
    .filter((q) => q.id !== movedId)
    .sort(
      (a, b) =>
        a.position - b.position || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    );
  const after = order.findIndex((q) => q.id === afterId);
  const before = order.findIndex((q) => q.id === beforeId);
  const at =
    after !== -1
      ? after + 1
      : before !== -1
        ? before
        : afterId === null
          ? 0
          : order.length;
  order.splice(at, 0, { id: movedId, position: -1 });
  return order.flatMap((q, position) =>
    q.id === movedId || q.position !== position ? [{ id: q.id, position }] : [],
  );
}
