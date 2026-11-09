import type CharacterSheet from '../../../interfaces/CharacterSheet';
import type { Spell } from '../../../interfaces/Spells';
import type { SpellModifierFilter } from '../../../interfaces/SpellModifiers';
import { getSpellTradition } from '../spellTradition';
import { isHealingRollLabel } from '../../spellRollAugmentation';

/** Rolagem de dano: tem tipo de dano ou o rótulo fala em dano. */
export function isDamageRollLabel(label: string, damageType?: string): boolean {
  if (isHealingRollLabel(label)) return false;
  return !!damageType || /dano/i.test(label);
}

const hasHealingRoll = (spell: Spell): boolean =>
  (spell.rolls ?? []).some((roll) => isHealingRollLabel(roll.label));

const hasDamageRoll = (spell: Spell): boolean =>
  (spell.rolls ?? []).some((roll) =>
    isDamageRollLabel(roll.label, roll.damageType)
  );

/** Classe principal (ou variante dela) ou multiclasse conjuradora. */
function sheetHasCasterClass(
  sheet: CharacterSheet | undefined,
  className: string
): boolean {
  if (!sheet) return false;
  const { classe } = sheet;
  if (
    classe?.name === className ||
    (classe?.isVariant === true && classe.baseClassName === className)
  ) {
    return true;
  }
  return Object.keys(sheet.multiclassSpellPaths ?? {}).includes(className);
}

/** Círculo da magia (1–5) a partir do rótulo "2º Circulo". */
export function getSpellCircle(spell: Spell): number {
  const match = /(\d)/.exec(spell.spellCircle ?? '');
  return match ? Number(match[1]) : 0;
}

/**
 * A magia passa no filtro? Campos combinam em E; listas são OU. `chosen` são
 * as magias que o jogador marcou para a fonte do modificador (`filter.chosen`).
 */
export function spellMatchesFilter(
  spell: Spell,
  filter: SpellModifierFilter | undefined,
  sheet?: CharacterSheet,
  chosen?: string[]
): boolean {
  if (!filter) return true;
  if (filter.chosen && !chosen?.includes(spell.nome)) return false;
  if (filter.circles && !filter.circles.includes(getSpellCircle(spell))) {
    return false;
  }
  if (filter.casterClass && !sheetHasCasterClass(sheet, filter.casterClass)) {
    return false;
  }
  if (filter.spellNames && !filter.spellNames.includes(spell.nome)) {
    return false;
  }
  if (filter.schools && !filter.schools.includes(spell.school)) return false;
  if (filter.ranges && !filter.ranges.includes(spell.alcance)) return false;
  if (filter.tradition) {
    // Universal conta como as duas: a ficha não guarda por qual classe a
    // magia foi aprendida (ver `spellTradition`).
    const tradition = getSpellTradition(spell.nome);
    if (tradition !== filter.tradition && tradition !== 'universal') {
      return false;
    }
  }
  if (filter.healing && !hasHealingRoll(spell)) return false;
  if (filter.damaging && !hasDamageRoll(spell)) return false;
  return true;
}
