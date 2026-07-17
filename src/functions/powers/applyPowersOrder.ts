export function applyPowersOrder<T extends { name: string }>(
  powers: T[],
  powersOrder?: string[]
): T[] {
  if (!powersOrder || powersOrder.length === 0) {
    return [...powers].sort((a, b) => a.name.localeCompare(b.name));
  }

  const orderIndex = new Map<string, number>();
  powersOrder.forEach((name, idx) => {
    orderIndex.set(name, idx);
  });

  const ordered: T[] = [];
  const remainder: T[] = [];
  powers.forEach((power) => {
    if (orderIndex.has(power.name)) {
      ordered.push(power);
    } else {
      remainder.push(power);
    }
  });

  ordered.sort(
    (a, b) => (orderIndex.get(a.name) ?? 0) - (orderIndex.get(b.name) ?? 0)
  );
  remainder.sort((a, b) => a.name.localeCompare(b.name));

  return [...ordered, ...remainder];
}

export default applyPowersOrder;
