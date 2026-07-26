import { PowerGroup } from './powerOrigins';

/**
 * Reordena um poder DENTRO do seu grupo e devolve o novo `sheet.powersOrder`.
 *
 * `powersOrder` é uma lista plana de nomes, mas a aba de Poderes exibe os
 * poderes agrupados por origem em ordem canônica. Como `groupPowersByOrigin`
 * preserva a ordem de entrada dentro de cada bucket, a lista plana consegue
 * expressar qualquer ordenação intra-grupo: basta reescrevê-la como a
 * concatenação dos grupos na ordem em que aparecem na tela.
 *
 * Recebe os grupos JÁ montados a partir da lista completa (sem busca nem
 * filtro de origem aplicados) — caso contrário a concatenação perderia os
 * poderes escondidos.
 */
export function reorderPowersWithinGroup<T extends { name: string }>(
  groups: PowerGroup<T>[],
  groupKey: string,
  from: number,
  to: number
): string[] {
  const flatten = () => groups.flatMap((g) => g.powers.map((p) => p.name));

  if (from === to) return flatten();

  const targetGroup = groups.find((group) => group.key === groupKey);
  if (!targetGroup) return flatten();

  const names = targetGroup.powers.map((power) => power.name);
  if (from < 0 || from >= names.length || to < 0 || to >= names.length) {
    return flatten();
  }

  const [moved] = names.splice(from, 1);
  names.splice(to, 0, moved);

  return groups.flatMap((group) =>
    group.key === groupKey ? names : group.powers.map((power) => power.name)
  );
}

export default reorderPowersWithinGroup;
