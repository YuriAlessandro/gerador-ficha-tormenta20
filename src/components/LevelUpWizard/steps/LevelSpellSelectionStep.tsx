import React from 'react';
import { Box, Typography } from '@mui/material';
import { Spell } from '@/interfaces/Spells';
import SpellCardPicker from '@/components/SpellPicker/SpellCardPicker';

interface LevelSpellSelectionStepProps {
  availableSpells: Spell[];
  selectedSpells: Spell[];
  requiredCount: number;
  spellCircle: number;
  onSpellToggle: (spell: Spell) => void;
  crossTraditionSpellNames?: Set<string>;
  crossTraditionLabel?: string;
  crossTraditionLimit?: number;
  /** Linhagem Abençoada no 1º nível via multiclasse. */
  minCrossTraditionSpells?: number;
}

const LevelSpellSelectionStep: React.FC<LevelSpellSelectionStepProps> = ({
  availableSpells,
  selectedSpells,
  requiredCount,
  spellCircle,
  onSpellToggle,
  crossTraditionSpellNames,
  crossTraditionLabel,
  crossTraditionLimit,
  minCrossTraditionSpells,
}) => (
  <Box>
    <Typography variant='h6' gutterBottom>
      Seleção de Magias - Até o {spellCircle}º Círculo
    </Typography>
    <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1 }}>
      Escolha {requiredCount} {requiredCount === 1 ? 'magia' : 'magias'} de até
      o {spellCircle}º círculo.
    </Typography>
    <SpellCardPicker
      availableSpells={availableSpells}
      selectedSpells={selectedSpells}
      requiredCount={requiredCount}
      onToggle={onSpellToggle}
      crossTraditionSpellNames={crossTraditionSpellNames}
      crossTraditionLabel={crossTraditionLabel}
      crossTraditionLimit={crossTraditionLimit}
      minCrossTraditionSpells={minCrossTraditionSpells}
      emptyMessage='Nenhuma magia disponível neste círculo. Você já conhece todas as magias disponíveis ou não há magias neste círculo para sua classe.'
    />
  </Box>
);

export default LevelSpellSelectionStep;
