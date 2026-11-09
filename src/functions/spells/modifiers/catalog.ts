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

/**
 * Habilidade de classe e poder são espaços de nome separados: "Força da
 * Natureza" é a habilidade de 20º nível do Druida (–2 PM) E um poder de Druida
 * de Heróis de Arton (forma selvagem), sem relação entre si.
 */
export type SpellModifierSourceKind = 'power' | 'ability' | 'item';

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

/**
 * `null` = nome AMBÍGUO no catálogo (duas entradas de mesmo nome com
 * modificadores diferentes, inclusive "com" × "sem"). Nesse caso o índice não
 * escolhe e o motor usa a cópia da própria ficha.
 */
type IndexValue = SpellModifier[] | null;

let cache: { key: string; map: Map<string, IndexValue> } | null = null;

function buildIndex(supplements: SupplementId[]): Map<string, IndexValue> {
  const map = new Map<string, IndexValue>();
  const signatures = new Map<string, string>();
  const add = (kind: SpellModifierSourceKind, entries: Entry[] = []) => {
    entries.forEach((entry) => {
      const name = entry.name ?? entry.nome;
      if (!name) return;
      const key = keyOf(kind, name);
      const modifiers = entry.spellModifiers ?? [];
      const signature = JSON.stringify(modifiers);
      const seen = signatures.get(key);
      if (seen === undefined) {
        signatures.set(key, signature);
        map.set(key, modifiers);
      } else if (seen !== signature) {
        map.set(key, null);
      }
    });
  };

  dataRegistry.getClassesBySupplements(supplements).forEach((classe) => {
    add('power', classe.powers);
    add('ability', classe.abilities);
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

/**
 * Modificadores que o catálogo declara para a fonte. `undefined` quando o
 * nome não está no catálogo ou é ambíguo — aí vale a cópia da ficha.
 */
export function getCatalogSpellModifiers(
  kind: SpellModifierSourceKind,
  name: string
): SpellModifier[] | undefined {
  const supplements = catalogSupplements();
  const key = supplements.join('|');
  if (cache?.key !== key) cache = { key, map: buildIndex(supplements) };
  return cache.map.get(keyOf(kind, name)) ?? undefined;
}

/** Só para testes. */
export function resetSpellModifierCatalogCache(): void {
  cache = null;
}
