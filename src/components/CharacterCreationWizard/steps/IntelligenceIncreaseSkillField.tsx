import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import Skill, { isOficioSkill } from '@/interfaces/Skills';
import SkillChipSelector from '@/components/common/SkillChipSelector';
import { getIntelligenceSkillOptions } from '@/functions/powers/intelligenceIncreaseSkills';

interface IntelligenceIncreaseSkillFieldProps {
  /** Quantas perícias o aumento de Inteligência concede. */
  pick: number;
  /** Inteligência antes do aumento. */
  intelligence: number;
  /** Quanto a Inteligência sobe. */
  increase: number;
  trainedSkills: Skill[];
  selectedSkills: Skill[];
  onChange: (skills: Skill[]) => void;
}

/**
 * Escolha das perícias treinadas que um aumento permanente de Inteligência
 * concede (JdA, "Escolhendo Perícias"). Aparece logo abaixo da escolha do
 * atributo no Aumento de Atributo e afins.
 */
const IntelligenceIncreaseSkillField: React.FC<
  IntelligenceIncreaseSkillFieldProps
> = ({
  pick,
  intelligence,
  increase,
  trainedSkills,
  selectedSkills,
  onChange,
}) => {
  if (pick <= 0) return null;

  const handleToggle = (skill: Skill) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter((selected) => selected !== skill));
    } else if (selectedSkills.length < pick) {
      onChange([...selectedSkills, skill]);
    }
  };

  const plural = pick > 1;

  return (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant='subtitle1'>
        Perícia{plural ? 's' : ''} por Inteligência
      </Typography>
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        Sua Inteligência vai de {intelligence} para {intelligence + increase}:
        você treina {pick} perícia{plural ? 's' : ''} nova{plural ? 's' : ''},
        que não precisa{plural ? 'm' : ''} ser da lista da sua classe.
      </Typography>
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        Selecionadas: {selectedSkills.length} / {pick}
      </Typography>
      <SkillChipSelector
        availableSkills={getIntelligenceSkillOptions(trainedSkills)}
        selectedSkills={selectedSkills}
        onToggle={handleToggle}
        maxReached={selectedSkills.length >= pick}
        allowCustomOficio
        unavailableOficios={trainedSkills.filter(isOficioSkill)}
      />
      {selectedSkills.length < pick && (
        <Alert severity='info'>
          Escolha {pick - selectedSkills.length} perícia
          {pick - selectedSkills.length > 1 ? 's' : ''} para continuar.
        </Alert>
      )}
    </Box>
  );
};

export default IntelligenceIncreaseSkillField;
