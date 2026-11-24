import React from 'react';
import { Box, Typography } from '@mui/material';
import type {
  ResolvedSpellChoice,
  SpellChoiceOption,
} from '@/functions/spells/modifiers';
import SpellChoiceEditor, {
  spellChoiceNoun,
} from '../../SheetResult/SpellsTab/SpellChoiceEditor';

// Movida para as regras puras; reexportada para quem já importava daqui.
export {
  getPowerSpellChoiceInfo,
  type PowerSpellChoiceInfo,
} from '@/functions/wizardRules/powerSpellChoice';

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
