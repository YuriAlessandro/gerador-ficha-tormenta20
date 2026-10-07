import { dataRegistry } from '../../data/registry';
import { SpellCircle } from '../../interfaces/Spells';
import { SupplementId } from '../../types/supplement.types';

/**
 * Tipo da magia como o livro imprime no cabeçalho: Arcana, Divina ou Universal.
 *
 * NÃO é um campo de `Spell`: o catálogo só sabe em qual lista (arcana, divina
 * ou nas duas) a magia aparece, e a cópia guardada na ficha não carrega nada
 * disso. Por isso o tipo é resolvido por NOME contra o registry.
 *
 * É o tipo do catálogo, não "como este personagem lança": uma universal de um
 * Arcanista é arcana para ele, mas a ficha não guarda de que classe ou poder
 * cada magia veio (Bardo, multiclasse, poder concedido).
 */
export type SpellTradition = 'arcane' | 'divine' | 'universal';

export const TRADITION_LABEL: Record<SpellTradition, string> = {
  arcane: 'Arcana',
  divine: 'Divina',
  universal: 'Universal',
};

/** Sufixos que `createTruqueSpell`/`createAlwaysActiveSpell` colam no nome. */
const RENAMED_SUFFIX = / \((Apenas Truque|Sempre Ativo)\)$/;

/**
 * Todos os suplementos oficiais, e não só os ativos do usuário: o drawer de
 * edição deixa adicionar magia de qualquer um deles. Mais os registrados em
 * runtime (homebrews, que chegam depois do login).
 */
const catalogSupplements = (): SupplementId[] => [
  ...Object.values(SupplementId),
  // Cast de fronteira, como em `useContentSupplements`.
  ...(dataRegistry.getRuntimeSupplementIds() as SupplementId[]),
];

let cache: { key: string; map: Map<string, SpellTradition> } | null = null;

/** Nome da magia → tipo. Cacheado enquanto a lista de suplementos não muda. */
export function getSpellTraditionMap(): Map<string, SpellTradition> {
  const supplements = catalogSupplements();
  const key = supplements.join('|');
  if (cache?.key === key) return cache.map;

  const map = new Map<string, SpellTradition>();
  const add = (circle: SpellCircle, tradition: 'arcane' | 'divine') => {
    Object.values(circle).forEach((spellsOfSchool) => {
      spellsOfSchool.forEach((spell) => {
        const existing = map.get(spell.nome);
        map.set(
          spell.nome,
          existing && existing !== tradition ? 'universal' : tradition
        );
      });
    });
  };

  for (let circle = 1; circle <= 5; circle += 1) {
    const { arcane, divine } = dataRegistry.getSpellsByCircleAndSupplements(
      circle,
      supplements
    );
    add(arcane, 'arcane');
    add(divine, 'divine');
  }

  cache = { key, map };
  return map;
}

/**
 * Tipo de uma magia pelo nome. `undefined` quando o catálogo não a conhece
 * (magia personalizada, homebrew de pacote desativado).
 */
export function getSpellTradition(nome: string): SpellTradition | undefined {
  const map = getSpellTraditionMap();
  return map.get(nome) ?? map.get(nome.replace(RENAMED_SUFFIX, ''));
}

/**
 * Filtro "Tipo" da ficha. Universal passa nos dois, como na enciclopédia;
 * magia sem tipo conhecido só aparece em "Todas".
 */
export function matchesTraditionFilter(
  tradition: SpellTradition | undefined,
  filter: 'arcane' | 'divine' | 'all'
): boolean {
  if (filter === 'all') return true;
  return tradition === filter || tradition === 'universal';
}
