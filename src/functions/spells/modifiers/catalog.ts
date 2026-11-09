import { dataRegistry } from '../../../data/registry';
import type { SpellModifier } from '../../../interfaces/SpellModifiers';
import { SupplementId } from '../../../types/supplement.types';

/**
 * Índice "nome → `spellModifiers`" de tudo o que o catálogo declara: livros e
 * homebrews registrados em runtime.
 *
 * A ficha salva guarda uma CÓPIA de cada poder e item. Lendo o catálogo pelo
 * nome, toda ficha — inclusive as salvas antes de um modificador existir —
 * recebe a versão atual sem migração. A cópia da ficha só manda quando o nome
 * não está no catálogo (poder/item criado à mão na ficha).
 */

export type SpellModifierSourceKind = 'power' | 'item';

interface Entry {
  name?: string;
  nome?: string;
  spellModifiers?: SpellModifier[];
}

/** Todos os suplementos, como em `spellTradition`: o índice é só lookup. */
const catalogSupplements = (): SupplementId[] => [
  ...Object.values(SupplementId),
  ...(dataRegistry.getRuntimeSupplementIds() as SupplementId[]),
];

const keyOf = (kind: SpellModifierSourceKind, name: string): string =>
  `${kind}:${name}`;

let cache: { key: string; map: Map<string, SpellModifier[]> } | null = null;

function buildIndex(supplements: SupplementId[]): Map<string, SpellModifier[]> {
  const map = new Map<string, SpellModifier[]>();
  const add = (kind: SpellModifierSourceKind, entries: Entry[] = []) => {
    entries.forEach((entry) => {
      const name = entry.name ?? entry.nome;
      if (name && entry.spellModifiers?.length) {
        map.set(keyOf(kind, name), entry.spellModifiers);
      }
    });
  };

  dataRegistry.getClassesBySupplements(supplements).forEach((classe) => {
    add('power', classe.powers);
    add('power', classe.abilities);
  });
  add('power', dataRegistry.getAllPowersBySupplements(supplements));
  dataRegistry.getRacesBySupplements(supplements).forEach((race) => {
    add('power', race.abilities);
  });
  dataRegistry.getOriginsBySupplements(supplements).forEach((origin) => {
    add('power', origin.poderes as Entry[]);
  });
  Object.values(dataRegistry.getEquipmentBySupplements(supplements)).forEach(
    (items: Entry[]) => add('item', items)
  );

  return map;
}

/** Modificadores que o catálogo declara para a fonte, ou `undefined`. */
export function getCatalogSpellModifiers(
  kind: SpellModifierSourceKind,
  name: string
): SpellModifier[] | undefined {
  const supplements = catalogSupplements();
  const key = supplements.join('|');
  if (cache?.key !== key) cache = { key, map: buildIndex(supplements) };
  return cache.map.get(keyOf(kind, name));
}

/** Só para testes. */
export function resetSpellModifierCatalogCache(): void {
  cache = null;
}
