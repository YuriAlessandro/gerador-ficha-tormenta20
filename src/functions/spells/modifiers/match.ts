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

/** A magia passa no filtro? Campos combinam em E; listas são OU. */
export function spellMatchesFilter(
  spell: Spell,
  filter: SpellModifierFilter | undefined
): boolean {
  if (!filter) return true;
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
