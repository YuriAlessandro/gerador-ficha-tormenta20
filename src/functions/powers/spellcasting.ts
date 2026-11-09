import CharacterSheet from '../../interfaces/CharacterSheet';
import { SpellPath } from '../../interfaces/Class';
import { Spell } from '../../interfaces/Spells';
import { findClassDescription, getClassLevelsMap } from '../multiclass';
import { getSpellTradition } from '../spells/spellTradition';

/** Tradição exigida por "Lançar magias arcanas/divinas". */
export type CastingTradition = 'arcane' | 'divine';

export const CASTING_TRADITION_LABEL: Record<CastingTradition, string> = {
  arcane: 'arcanas',
  divine: 'divinas',
};

const TRADITIONS_OF_SPELL_TYPE: Record<
  SpellPath['spellType'],
  CastingTradition[]
> = {
  Arcane: ['arcane'],
  Divine: ['divine'],
  Both: ['arcane', 'divine'],
};

/** "2º Circulo" → 2. */
const circleOf = (spell: Spell): number => parseInt(spell.spellCircle, 10) || 1;

/**
 * Magias que contam como "você lança". As injetadas por encantamento de
 * equipamento ficam de fora: somem quando o item sai, e o poder não pode
 * depender de qual item está equipado.
 */
const castableSpells = (sheet: CharacterSheet): Spell[] =>
  (sheet.spells ?? []).filter((spell) => !spell.equipmentSource);

function otherTradition(tradition: CastingTradition): CastingTradition {
  return tradition === 'arcane' ? 'divine' : 'arcane';
}

interface ClassCasting {
  traditions: CastingTradition[];
  /** Maior círculo liberado no nível atual da classe. */
  circle: number;
}

/**
 * O que cada classe com magia (inclusive multiclasse) libera no nível dela.
 * Conta mesmo antes de a magia ser aprendida: no assistente de subida de
 * nível o poder é escolhido ANTES das magias, e no nível em que o Arcanista
 * ganha o 2º círculo ele já "lança magias de 2º círculo".
 */
function getClassCastings(sheet: CharacterSheet): ClassCasting[] {
  const castings: ClassCasting[] = [];
  getClassLevelsMap(sheet).forEach((level, className) => {
    const spellPath =
      className === sheet.classe?.name
        ? sheet.classe.spellPath
        : findClassDescription(className)?.spellPath;
    const circle = spellPath?.spellCircleAvailableAtLevel?.(level) ?? 0;
    if (spellPath && circle > 0) {
      castings.push({
        traditions: TRADITIONS_OF_SPELL_TYPE[spellPath.spellType] ?? [],
        circle,
      });
    }
  });
  return castings;
}

/**
 * Magia de catálogo da outra lista não conta para a tradição pedida. Universal
 * e customizada contam: a ficha não guarda de onde cada magia veio, e a
 * universal é arcana para o Arcanista e divina para o Clérigo.
 */
function spellCountsFor(spell: Spell, tradition?: CastingTradition): boolean {
  if (!tradition) return true;
  const spellTradition = getSpellTradition(spell.nome);
  if (spellTradition === tradition) return true;
  if (spellTradition === otherTradition(tradition)) return false;
  return true;
}

/**
 * "Lançar magias", "Lançar magias de Nº círculo", "Lançar magias divinas".
 * Vale pelo círculo que uma classe libera no nível dela ou por uma magia na
 * ficha (de raça, poder, origem) do círculo pedido ou acima. Com tradição,
 * magia universal ou customizada só conta se alguma classe ou magia exclusiva
 * da ficha confirmar que ela lança por essa tradição.
 */
export function sheetCastsSpells(
  sheet: CharacterSheet,
  requirement: { circle?: number; tradition?: CastingTradition } = {}
): boolean {
  const { circle = 1, tradition } = requirement;
  const castings = getClassCastings(sheet);

  const byClass = castings.some(
    (casting) =>
      casting.circle >= circle &&
      (!tradition || casting.traditions.includes(tradition))
  );
  if (byClass) return true;

  const spells = castableSpells(sheet).filter(
    (spell) => circleOf(spell) >= circle && spellCountsFor(spell, tradition)
  );
  if (!tradition) return spells.length > 0;

  const confirmed =
    castings.some((casting) => casting.traditions.includes(tradition)) ||
    castableSpells(sheet).some(
      (spell) => getSpellTradition(spell.nome) === tradition
    );
  return confirmed && spells.length > 0;
}
