import type CharacterSheet from '@/interfaces/CharacterSheet';
import type { ClassPower } from '@/interfaces/Class';
import type { GeneralPower } from '@/interfaces/Poderes';
import type { Spell } from '@/interfaces/Spells';
import type { LevelUpSelections } from '@/interfaces/WizardSelections';
import {
  getSheetSpellChoices,
  getSpellChoiceOptions,
  ResolvedSpellChoice,
  SpellChoiceOption,
} from '@/functions/spells/modifiers';

/**
 * Escolha "escolha uma magia" do poder do nível (Foco em Magia). Mora nas
 * regras puras para o assistente de subir de nível e o motor sem sorteio
 * (Builds v2) usarem a mesma conta; o passo do assistente reexporta.
 */

export interface PowerSpellChoiceInfo {
  choice: ResolvedSpellChoice;
  options: SpellChoiceOption[];
}

/**
 * A escolha de magias do poder do nível, como ficará na ficha: o poder já
 * somado (uma vaga a mais em Foco em Magia) e as magias aprendidas neste
 * nível já elegíveis. `null` = o poder não pede escolha.
 */
export function getPowerSpellChoiceInfo(
  sheet: CharacterSheet,
  powerChoice: LevelUpSelections['powerChoice'],
  power: ClassPower | GeneralPower | undefined,
  spellsLearned: Spell[] | undefined,
  draft: Record<string, string[]> | undefined
): PowerSpellChoiceInfo | null {
  if (!power) return null;
  const preview: CharacterSheet =
    powerChoice === 'general'
      ? {
          ...sheet,
          generalPowers: [
            ...(sheet.generalPowers ?? []),
            power as GeneralPower,
          ],
        }
      : {
          ...sheet,
          classPowers: [...(sheet.classPowers ?? []), power as ClassPower],
        };
  preview.spells = [...(sheet.spells ?? []), ...(spellsLearned ?? [])];
  const resolved = getSheetSpellChoices(preview).find(
    (choice) => choice.source === power.name
  );
  if (!resolved) return null;
  const choice: ResolvedSpellChoice = {
    ...resolved,
    chosen: (draft?.[power.name] ?? resolved.chosen).slice(0, resolved.max),
  };
  return { choice, options: getSpellChoiceOptions(preview, choice) };
}
