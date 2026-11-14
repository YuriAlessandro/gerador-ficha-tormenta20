import type {
  SheetAction,
  SheetChangeSource,
} from '../../../../interfaces/CharacterSheet';
import { allSpellSchools, SpellSchool } from '../../../../interfaces/Spells';
import type { SpellModifierEffect } from '../../../../interfaces/SpellModifiers';
import { SCHOOL_LABELS } from '../../../../components/SpellPicker/schoolLabels';

/**
 * "Escolha uma escola de magia. <efeito> nas magias dessa escola" (Mestre em
 * Escola, Especialista em Escola). Uma opção por escola, nomeada pelo rótulo
 * (convenção de `spellSchoolFromLabel`, como no Xamã Místico), cada uma com o
 * `spellModifiers` filtrado pela própria escola. A escolha fica em
 * `optionChoices[optionKey]`, de onde o motor de modificadores a lê.
 */
export function buildSchoolChoiceAction(
  source: SheetChangeSource,
  optionKey: string,
  effect: SpellModifierEffect,
  describe: (schoolLabel: string) => string
): SheetAction {
  return {
    source,
    action: {
      type: 'chooseFromOptions',
      optionKey,
      options: allSpellSchools.map((school: SpellSchool) => ({
        name: SCHOOL_LABELS[school],
        text: describe(SCHOOL_LABELS[school]),
        spellModifiers: [{ filter: { schools: [school] }, effect }],
      })),
    },
  };
}
