import { dataRegistry } from '../../../data/registry';
import type { SheetAction } from '../../../interfaces/CharacterSheet';
import type {
  SpellModifier,
  SpellModifierChoiceSpec,
} from '../../../interfaces/SpellModifiers';
import { SupplementId } from '../../../types/supplement.types';

/**
 * Índice "nome → modificadores de magia" de tudo o que o catálogo declara:
 * livros e homebrews registrados em runtime.
 *
 * A ficha salva guarda uma CÓPIA de cada poder e item. Lendo o catálogo pelo
 * nome, toda ficha — inclusive as salvas antes de um modificador existir —
 * recebe a versão atual sem migração. A cópia da ficha só manda quando o nome
 * não está no catálogo (poder/item criado à mão na ficha) ou é ambíguo.
 */

/**
 * Habilidade de classe e poder são espaços de nome separados: "Força da
 * Natureza" é a habilidade de 20º nível do Druida (–2 PM) E um poder de Druida
 * de Heróis de Arton (forma selvagem), sem relação entre si.
 */
export type SpellModifierSourceKind = 'power' | 'ability' | 'item';

/** Uma escolha (`chooseFromOptions`) cujas opções concedem modificadores. */
export interface SpellModifierChoice {
  optionKey: string;
  /** Nome da opção → modificadores que ela concede. */
  options: Record<string, SpellModifier[]>;
}

/** O que uma entrada declara: modificadores diretos e por escolha. */
export interface SpellModifierSource {
  modifiers: SpellModifier[];
  choices: SpellModifierChoice[];
  /** "Escolha N magias" (modificadores com `filter.chosen`). */
  spellChoice?: SpellModifierChoiceSpec;
}

export interface SpellModifierEntry {
  name?: string;
  nome?: string;
  spellModifiers?: SpellModifier[];
  spellChoice?: SpellModifierChoiceSpec;
  sheetActions?: SheetAction[];
}

/** Extrai a fonte de modificadores de uma entrada (catálogo ou cópia). */
export function extractSpellModifierSource(
  entry: SpellModifierEntry
): SpellModifierSource {
  const choices: SpellModifierChoice[] = [];
  (entry.sheetActions ?? []).forEach(({ action }) => {
    if (action.type !== 'chooseFromOptions') return;
    const options: Record<string, SpellModifier[]> = {};
    action.options.forEach((option) => {
      if (option.spellModifiers?.length) {
        options[option.name] = option.spellModifiers;
      }
    });
    if (Object.keys(options).length > 0) {
      choices.push({ optionKey: action.optionKey, options });
    }
  });
  return {
    modifiers: entry.spellModifiers ?? [],
    choices,
    ...(entry.spellChoice ? { spellChoice: entry.spellChoice } : {}),
  };
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
type IndexValue = SpellModifierSource | null;

let cache: { key: string; map: Map<string, IndexValue> } | null = null;

function buildIndex(supplements: SupplementId[]): Map<string, IndexValue> {
  const map = new Map<string, IndexValue>();
  const signatures = new Map<string, string>();
  const add = (
    kind: SpellModifierSourceKind,
    entries: SpellModifierEntry[] = []
  ) => {
    entries.forEach((entry) => {
      const name = entry.name ?? entry.nome;
      if (!name) return;
      const key = keyOf(kind, name);
      const source = extractSpellModifierSource(entry);
      const signature = JSON.stringify(source);
      const seen = signatures.get(key);
      if (seen === undefined) {
        signatures.set(key, signature);
        map.set(key, source);
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
    add('power', origin.poderes as SpellModifierEntry[]);
  });
  Object.values(dataRegistry.getEquipmentBySupplements(supplements)).forEach(
    (items: SpellModifierEntry[]) => add('item', items)
  );

  return map;
}

/**
 * O que o catálogo declara para a fonte. `undefined` quando o nome não está no
 * catálogo ou é ambíguo — aí vale a cópia da ficha.
 */
export function getCatalogSpellModifierSource(
  kind: SpellModifierSourceKind,
  name: string
): SpellModifierSource | undefined {
  const supplements = catalogSupplements();
  const key = supplements.join('|');
  if (cache?.key !== key) cache = { key, map: buildIndex(supplements) };
  return cache.map.get(keyOf(kind, name)) ?? undefined;
}

/** Só para testes. */
export function resetSpellModifierCatalogCache(): void {
  cache = null;
}
