import type Equipment from '../interfaces/Equipment';

/**
 * Locais de um item da mochila: com o personagem, dentro de um RECIPIENTE
 * (Alforje, Carroça…) ou guardado fora da aventura (estalagem, casa, base).
 *
 * Só o que está COM o personagem conta na carga (`Bag.getSpaces`) — é o que
 * decide sobrecarga. A escolha mora no próprio item (`Equipment.storedIn`):
 * `undefined` = com você, então item novo, de qualquer caminho (mercado,
 * origem, tesouro, geração aleatória), nasce carregado — o mesmo raciocínio de
 * opt-out de `unwornClothingIds`.
 */

/** Valor de `storedIn` para "guardado fora da aventura" (sem limite). */
export const STASH_LOCATION = 'stash';

/**
 * Capacidade, em espaços, dos recipientes do catálogo — por `nome`, e não por
 * campo no item, porque a mochila é um snapshot congelado do catálogo: um
 * Alforje comprado antes desta regra existir não teria o campo.
 *
 * - Alforje (JdA, Animais): "permitem que um parceiro montaria carregue até 10
 *   espaços de item para você".
 * - Veículos (JdA e Heróis de Arton, Veículos): "Passageiros e Carga".
 *
 * Item criado pelo usuário/homebrew declara a sua em `containerCapacity`.
 */
export const CONTAINER_CAPACITY_BY_NAME: Readonly<Record<string, number>> = {
  Alforje: 10,
  // JdA
  'Balão goblin': 160,
  Canoa: 80,
  Carroça: 80,
  Carruagem: 80,
  // Heróis de Arton
  Barcaça: 300,
  'Biga de guerra': 40,
  'Dirigível goblin': 320,
  Jangada: 80,
  Veleiro: 1200,
};

/**
 * Capacidade TOTAL do recipiente (por unidade × quantidade: dois Alforjes em
 * duas montarias carregam 20). `undefined` = o item não é recipiente.
 */
export function getContainerCapacity(item: Equipment): number | undefined {
  const perUnit =
    item.containerCapacity ?? CONTAINER_CAPACITY_BY_NAME[item.nome];
  if (perUnit === undefined || perUnit <= 0) return undefined;
  return perUnit * Math.max(1, item.quantity ?? 1);
}

export function isContainer(item: Equipment): boolean {
  return getContainerCapacity(item) !== undefined;
}

/** Ids dos recipientes presentes na lista. */
export function getContainerIds(items: Equipment[]): Set<string> {
  const ids = new Set<string>();
  items.forEach((item) => {
    if (item.id && isContainer(item)) ids.add(item.id);
  });
  return ids;
}

/**
 * Onde o item está DE FATO. Um `storedIn` que aponta para um recipiente que
 * não está mais na mochila (vendido, apagado, ficha editada em outro
 * dispositivo) volta a ser "com você": o item não some da carga em silêncio.
 * Recipiente dentro de recipiente não existe — só pode ir para o guardado.
 */
export function resolveLocation(
  item: Equipment,
  containerIds: Set<string>
): string | undefined {
  const { storedIn } = item;
  if (!storedIn) return undefined;
  if (storedIn === STASH_LOCATION) return STASH_LOCATION;
  if (isContainer(item)) return undefined;
  return containerIds.has(storedIn) ? storedIn : undefined;
}

export function isCarried(item: Equipment, containerIds: Set<string>): boolean {
  return resolveLocation(item, containerIds) === undefined;
}

/** Só os itens que o personagem carrega (os que contam na carga). */
export function filterCarried(items: Equipment[]): Equipment[] {
  const containerIds = getContainerIds(items);
  return items.filter((item) => isCarried(item, containerIds));
}

export interface StorageLocationUsage {
  /** Id do recipiente, ou `STASH_LOCATION`. */
  location: string;
  /** Recipiente (ausente para o guardado). */
  container?: Equipment;
  label: string;
  used: number;
  /** `undefined` = sem limite (guardado). */
  capacity?: number;
  items: Equipment[];
}

export function getContainerLabel(container: Equipment): string {
  return container.customDisplayName || container.nome;
}

/**
 * Locais fora do personagem, na ordem da lista recebida (recipientes primeiro,
 * guardado por último), com o que há em cada um. Recipientes vazios entram —
 * são destinos possíveis. O guardado só entra quando tem algo.
 *
 * `getSpaces` é injetado para não importar `Bag` (que importa este módulo).
 */
export function getStorageUsage(
  items: Equipment[],
  getSpaces: (item: Equipment) => number
): StorageLocationUsage[] {
  const containerIds = getContainerIds(items);
  const byLocation = new Map<string, Equipment[]>();
  items.forEach((item) => {
    const location = resolveLocation(item, containerIds);
    if (!location) return;
    const list = byLocation.get(location);
    if (list) list.push(item);
    else byLocation.set(location, [item]);
  });

  const sum = (list: Equipment[]) =>
    list.reduce((acc, item) => acc + getSpaces(item), 0);

  const out: StorageLocationUsage[] = [];
  items.forEach((item) => {
    if (!item.id || !containerIds.has(item.id)) return;
    const contents = byLocation.get(item.id) ?? [];
    out.push({
      location: item.id,
      container: item,
      label: getContainerLabel(item),
      used: sum(contents),
      capacity: getContainerCapacity(item),
      items: contents,
    });
  });
  const stashed = byLocation.get(STASH_LOCATION);
  if (stashed && stashed.length > 0) {
    out.push({
      location: STASH_LOCATION,
      label: 'Guardado',
      used: sum(stashed),
      items: stashed,
    });
  }
  return out;
}

/**
 * Rótulo curto do local de um item fora do personagem (para a aba de
 * Equipamentos e o PDF). `undefined` = com você.
 */
export function getLocationLabel(
  item: Equipment,
  items: Equipment[]
): string | undefined {
  const containerIds = getContainerIds(items);
  const location = resolveLocation(item, containerIds);
  if (!location) return undefined;
  if (location === STASH_LOCATION) return 'Guardado';
  const container = items.find((it) => it.id === location);
  return container ? getContainerLabel(container) : undefined;
}
