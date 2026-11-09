import React from 'react';
import { Box, Typography } from '@mui/material';
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
import SpellChoiceEditor, {
  spellChoiceNoun,
} from '../../SheetResult/SpellsTab/SpellChoiceEditor';

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

interface PowerSpellChoiceStepProps {
  choice: ResolvedSpellChoice;
  options: SpellChoiceOption[];
  onChange: (values: string[]) => void;
}

const PowerSpellChoiceStep: React.FC<PowerSpellChoiceStepProps> = ({
  choice,
  options,
  onChange,
}) => (
  <Box>
    <Typography variant='h6' gutterBottom>
      {choice.source}
    </Typography>
    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
      Escolha {choice.max} {spellChoiceNoun(choice.of, choice.max)} para o
      poder. Dá para trocar depois pelo ícone de varinha no poder, na ficha.
    </Typography>
    <SpellChoiceEditor
      of={choice.of}
      options={options}
      max={choice.max}
      value={choice.chosen}
      onChange={onChange}
    />
  </Box>
);

export default PowerSpellChoiceStep;
