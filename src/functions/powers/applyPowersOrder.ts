type OrderablePower = { name: string; customName?: string };

// A ordenação alfabética segue o nome EXIBIDO (é o que o usuário lê na lista),
// mas `powersOrder` guarda sempre o nome canônico — renomear um poder nunca
// perde a posição manual dele.
const displayName = (power: OrderablePower) =>
  power.customName?.trim() || power.name;

export function applyPowersOrder<T extends OrderablePower>(
  powers: T[],
  powersOrder?: string[]
): T[] {
  if (!powersOrder || powersOrder.length === 0) {
    return [...powers].sort((a, b) =>
      displayName(a).localeCompare(displayName(b))
    );
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
  remainder.sort((a, b) => displayName(a).localeCompare(displayName(b)));

  return [...ordered, ...remainder];
}

export default applyPowersOrder;
