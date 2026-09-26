import {
  buildEncyclopediaIndex,
  EncyclopediaEntry,
  encyclopediaIds,
} from '../encyclopediaSearch';
import { dataRegistry, GeneralPowerWithSupplement } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { Spell, SpellCircle } from '../../interfaces/Spells';
import { GeneralPowerType } from '../../interfaces/Poderes';
import { filterOfId, GrimoireFilter, nameFromId, prefixOf } from './itemId';

export type SpellKind = 'Arcana' | 'Divina';

export interface GrimoireSpell extends Spell {
  spellTypes: SpellKind[];
  circle: number;
}

export type ResolvedItem =
  | {
      kind: 'spell';
      id: string;
      entry: EncyclopediaEntry;
      spell: GrimoireSpell;
    }
  | {
      kind: 'power';
      id: string;
      entry: EncyclopediaEntry;
      power: GeneralPowerWithSupplement;
    }
  | { kind: 'generic'; id: string; entry: EncyclopediaEntry }
  | { kind: 'summary'; id: string; entry: EncyclopediaEntry }
  | { kind: 'missing'; id: string; name: string };

export interface ResolvedGroup {
  key: string;
  label: string;
  items: ResolvedItem[];
}

interface GrimoireCatalog {
  index: EncyclopediaEntry[];
  byId: Map<string, EncyclopediaEntry>;
  /** Por nome da magia (é o `param` das entradas `spell:`). */
  spells: Map<string, GrimoireSpell>;
  /** Pelo id do índice (`power:<tipo>:<nome>`). */
  powers: Map<string, GeneralPowerWithSupplement>;
  /** Nome do poder geral → id do índice (nomes são únicos entre os tipos). */
  powerIdByName: Map<string, string>;
}

/**
 * Todos os suplementos, de propósito: um item guardado no grimório não pode
 * "sumir" porque o suplemento dele está desativado na enciclopédia.
 */
const ALL_SUPPLEMENTS = Object.values(SupplementId);

const SUMMARY_PREFIXES = ['class', 'race', 'origin', 'deity'];

const GROUPS: { key: string; label: string }[] = [
  { key: 'spell-1', label: 'Magias · 1º círculo' },
  { key: 'spell-2', label: 'Magias · 2º círculo' },
  { key: 'spell-3', label: 'Magias · 3º círculo' },
  { key: 'spell-4', label: 'Magias · 4º círculo' },
  { key: 'spell-5', label: 'Magias · 5º círculo' },
  { key: 'power', label: 'Poderes gerais' },
  { key: 'class-power', label: 'Poderes de classe' },
  { key: 'class-ability', label: 'Habilidades de classe' },
  { key: 'origin-power', label: 'Poderes de origem' },
  { key: 'deity-power', label: 'Poderes concedidos' },
  { key: 'race-ability', label: 'Habilidades de raça' },
  { key: 'class', label: 'Classes' },
  { key: 'race', label: 'Raças' },
  { key: 'origin', label: 'Origens' },
  { key: 'deity', label: 'Divindades' },
  { key: 'other', label: 'Outros' },
  { key: 'missing', label: 'Não encontrados' },
];

const KNOWN_GROUP_KEYS = new Set(GROUPS.map((g) => g.key));

function collectSpells(): Map<string, GrimoireSpell> {
  const spells = new Map<string, GrimoireSpell>();

  const add = (circle: SpellCircle, kind: SpellKind, circleNumber: number) => {
    Object.values(circle).forEach((spellsOfSchool) => {
      spellsOfSchool.forEach((spell) => {
        const existing = spells.get(spell.nome);
        if (existing) {
          if (!existing.spellTypes.includes(kind)) {
            existing.spellTypes.push(kind);
          }
        } else {
          spells.set(spell.nome, {
            ...spell,
            spellTypes: [kind],
            circle: circleNumber,
          });
        }
      });
    });
  };

  for (let circle = 1; circle <= 5; circle += 1) {
    const { arcane, divine } = dataRegistry.getSpellsByCircleAndSupplements(
      circle,
      ALL_SUPPLEMENTS
    );
    add(arcane, 'Arcana', circle);
    add(divine, 'Divina', circle);
  }
  return spells;
}

function collectPowers(): Map<string, GeneralPowerWithSupplement> {
  const powers = new Map<string, GeneralPowerWithSupplement>();
  const byType = dataRegistry.getPowersWithSupplementInfo(ALL_SUPPLEMENTS);
  (Object.keys(byType) as GeneralPowerType[]).forEach((type) => {
    byType[type].forEach((power) => {
      powers.set(`power:${type}:${power.name}`, power);
    });
  });
  return powers;
}

let catalog: GrimoireCatalog | null = null;

/** Índice completo e dados detalhados, montados uma vez por sessão. */
export function getGrimoireCatalog(): GrimoireCatalog {
  if (!catalog) {
    const index = buildEncyclopediaIndex(ALL_SUPPLEMENTS);
    const powers = collectPowers();
    catalog = {
      index,
      byId: new Map(index.map((entry) => [entry.id, entry])),
      spells: collectSpells(),
      powers,
      powerIdByName: new Map(
        Array.from(powers.entries()).map(([id, power]) => [power.name, id])
      ),
    };
  }
  return catalog;
}

/**
 * Id do índice para um poder geral. O índice agrupa pela lista em que o poder
 * está, que nem sempre bate com o campo `type` (ex.: "Magia Acelerada" está
 * entre os poderes de Magia mas tem `type: DESTINO`), então quem só tem o
 * objeto do poder deve montar o id por aqui, não com `power.type`.
 */
export function powerItemId(power: { name: string; type: string }): string {
  return (
    getGrimoireCatalog().powerIdByName.get(power.name) ??
    `power:${power.type}:${power.name}`
  );
}

export const getFullEncyclopediaIndex = (): EncyclopediaEntry[] =>
  getGrimoireCatalog().index;

export function resolveItem(id: string): ResolvedItem {
  const { byId, spells, powers } = getGrimoireCatalog();
  const entry = byId.get(id);
  if (!entry) return { kind: 'missing', id, name: nameFromId(id) };

  const prefix = prefixOf(id);
  const spell = prefix === 'spell' ? spells.get(entry.param) : undefined;
  if (spell) return { kind: 'spell', id, entry, spell };

  const power = prefix === 'power' ? powers.get(id) : undefined;
  if (power) return { kind: 'power', id, entry, power };

  if (SUMMARY_PREFIXES.includes(prefix)) return { kind: 'summary', id, entry };
  return { kind: 'generic', id, entry };
}

/**
 * Id do índice para um nó da árvore de poderes de uma classe. Opções de
 * habilidade e nós externos não são itens da enciclopédia: sem id.
 */
export function treeNodeItemId(
  classe: { name: string; subname?: string },
  node: { kind: string; name: string }
): string | undefined {
  switch (node.kind) {
    case 'power':
      return encyclopediaIds.classPower(classe, node.name);
    case 'ability':
      return encyclopediaIds.classAbility(classe, node.name);
    case 'general':
      return getGrimoireCatalog().powerIdByName.get(node.name);
    default:
      return undefined;
  }
}

export const resolveItems = (ids: string[]): ResolvedItem[] =>
  ids.map(resolveItem);

export const itemTitle = (item: ResolvedItem): string =>
  item.kind === 'missing' ? item.name : item.entry.title;

function groupKeyOf(item: ResolvedItem): string {
  if (item.kind === 'missing') return 'missing';
  if (item.kind === 'spell') return `spell-${item.spell.circle}`;
  const prefix = prefixOf(item.id);
  return KNOWN_GROUP_KEYS.has(prefix) ? prefix : 'other';
}

export function groupResolvedItems(items: ResolvedItem[]): ResolvedGroup[] {
  const buckets = new Map<string, ResolvedItem[]>();
  items.forEach((item) => {
    const key = groupKeyOf(item);
    buckets.set(key, [...(buckets.get(key) ?? []), item]);
  });

  return GROUPS.filter((group) => buckets.has(group.key)).map((group) => ({
    ...group,
    items: [...(buckets.get(group.key) ?? [])].sort((a, b) =>
      itemTitle(a).localeCompare(itemTitle(b), 'pt-BR')
    ),
  }));
}

/** Itens não encontrados aparecem em todos os filtros, para não sumirem. */
export function matchesFilter(
  item: ResolvedItem,
  filter: GrimoireFilter
): boolean {
  if (filter === 'all' || item.kind === 'missing') return true;
  return filterOfId(item.id) === filter;
}

export const encyclopediaPath = (entry: EncyclopediaEntry): string =>
  `/database/${entry.route}/${encodeURIComponent(entry.param)}`;
