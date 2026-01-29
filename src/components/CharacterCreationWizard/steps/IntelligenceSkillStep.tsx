import React from 'react';
import { Box, Typography, Alert, Chip } from '@mui/material';
import Skill from '@/interfaces/Skills';

interface IntelligenceSkillStepProps {
  availableSkills: Skill[];
  selectedSkills: Skill[];
  onChange: (skills: Skill[]) => void;
  requiredCount: number;
  intelligenceModifier: number;
}

const IntelligenceSkillStep: React.FC<IntelligenceSkillStepProps> = ({
  availableSkills,
  selectedSkills,
  onChange,
  requiredCount,
  intelligenceModifier,
}) => {
  const handleToggleSkill = (skill: Skill) => {
    if (selectedSkills.includes(skill)) {
      // Remove skill
      onChange(selectedSkills.filter((s) => s !== skill));
    } else if (selectedSkills.length < requiredCount) {
      // Add skill (only if under limit)
      onChange([...selectedSkills, skill]);
    }
  };

  const isComplete = (): boolean => selectedSkills.length === requiredCount;

  // If modifier is <= 0, no skills to select
  if (requiredCount <= 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant='body1' color='text.secondary'>
          Seu modificador de Inteligência é {intelligenceModifier}, portanto
          você não pode selecionar perícias adicionais.
        </Typography>
        <Alert severity='info'>Você pode continuar para o próximo passo.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        Com base no seu modificador de Inteligência (+{intelligenceModifier}),
        você pode escolher {requiredCount} perícia
        {requiredCount > 1 ? 's' : ''} adicional
        {requiredCount > 1 ? 'is' : ''} entre todas as perícias disponíveis no
        jogo:
      </Typography>

      <Typography variant='caption' color='text.secondary'>
        Selecionadas: {selectedSkills.length} / {requiredCount}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        {availableSkills.map((skill) => {
          const isSelected = selectedSkills.includes(skill);
          const isDisabled =
            !isSelected && selectedSkills.length >= requiredCount;

          // Determine hover background color without nested ternary
          let hoverBgColor: string | undefined;
          if (isSelected) {
            hoverBgColor = 'primary.dark';
          } else if (!isDisabled) {
            hoverBgColor = 'rgba(209, 50, 53, 0.08)';
          }

          return (
            <Chip
              key={skill}
              label={skill}
              size='small'
              variant={isSelected ? 'filled' : 'outlined'}
              color={isSelected ? 'primary' : 'default'}
              onClick={() => handleToggleSkill(skill)}
              disabled={isDisabled}
              sx={{
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                '&:hover': {
                  backgroundColor: hoverBgColor,
                },
              }}
            />
          );
        })}
      </Box>

      {selectedSkills.length > requiredCount && (
        <Alert severity='error'>
          Você selecionou {selectedSkills.length} perícias, mas só pode escolher{' '}
          {requiredCount}.
        </Alert>
      )}

      {!isComplete() && selectedSkills.length > 0 && (
        <Alert severity='warning'>
          Selecione {requiredCount - selectedSkills.length} perícia
          {requiredCount - selectedSkills.length > 1 ? 's' : ''} adicional
          {requiredCount - selectedSkills.length > 1 ? 'is' : ''} para
          continuar.
        </Alert>
      )}

      {isComplete() && (
        <Alert severity='success'>
          Perícias selecionadas com sucesso! Você pode continuar para o próximo
          passo.
        </Alert>
      )}
    </Box>
  );
};

export default IntelligenceSkillStep;
