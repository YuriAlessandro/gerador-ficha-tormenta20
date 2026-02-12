import React from 'react';
import { Box, Typography, Alert, Chip, Divider } from '@mui/material';
import Skill from '@/interfaces/Skills';
import { BasicExpertise } from '@/interfaces/Class';

interface ClassSkillStepProps {
  // Base skills data
  periciasbasicas: BasicExpertise[];
  baseSkillChoices: Skill[];
  onBaseSkillChange: (choices: Skill[]) => void;

  // Remaining skills data
  availableSkills: Skill[];
  selectedSkills: Skill[];
  onChange: (skills: Skill[]) => void;
  requiredCount: number;

  className: string;
}

const ClassSkillStep: React.FC<ClassSkillStepProps> = ({
  periciasbasicas,
  baseSkillChoices,
  onBaseSkillChange,
  availableSkills,
  selectedSkills,
  onChange,
  requiredCount,
  className,
}) => {
  const hasOrGroups = periciasbasicas.some((be) => be.type === 'or');

  const handleOrChoice = (orGroupIndex: number, skill: Skill) => {
    const newChoices = [...baseSkillChoices];
    // If clicking the already-selected skill, deselect it
    if (newChoices[orGroupIndex] === skill) {
      newChoices.splice(orGroupIndex, 1, undefined as unknown as Skill);
      onBaseSkillChange(newChoices.filter(Boolean));
    } else {
      // Pad array if needed
      while (newChoices.length <= orGroupIndex) {
        newChoices.push(undefined as unknown as Skill);
      }
      newChoices[orGroupIndex] = skill;
      onBaseSkillChange(newChoices.filter(Boolean));
    }
  };

  const handleToggleSkill = (skill: Skill) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter((s) => s !== skill));
    } else if (selectedSkills.length < requiredCount) {
      onChange([...selectedSkills, skill]);
    }
  };

  const orGroupCount = periciasbasicas.filter((be) => be.type === 'or').length;
  const allOrGroupsChosen = baseSkillChoices.length === orGroupCount;
  const remainingComplete = selectedSkills.length === requiredCount;
  const isComplete =
    allOrGroupsChosen && (requiredCount === 0 || remainingComplete);

  // Track which 'or' group index we're on
  let orIndex = 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Section 1: Base Skills */}
      <Typography variant='body1' color='text.secondary'>
        Perícias básicas da classe {className}:
      </Typography>

      {periciasbasicas.map((be) => {
        if (be.type === 'and') {
          return (
            <Box key={`and-${be.list.join('-')}`}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {be.list.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size='small'
                    variant='filled'
                    color='success'
                    sx={{ cursor: 'default' }}
                  />
                ))}
              </Box>
            </Box>
          );
        }

        if (be.type === 'or') {
          const currentOrIndex = orIndex;
          orIndex += 1;
          const chosenSkill = baseSkillChoices[currentOrIndex];

          return (
            <Box key={`or-${be.list.join('-')}`}>
              <Typography variant='caption' color='text.secondary' mb={1}>
                Escolha uma:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                {be.list.map((skill) => {
                  const isSelected = chosenSkill === skill;
                  return (
                    <Chip
                      key={skill}
                      label={skill}
                      size='small'
                      variant={isSelected ? 'filled' : 'outlined'}
                      color={isSelected ? 'primary' : 'default'}
                      onClick={() => handleOrChoice(currentOrIndex, skill)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: isSelected
                            ? 'primary.dark'
                            : 'rgba(209, 50, 53, 0.08)',
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          );
        }

        return null;
      })}

      {hasOrGroups && !allOrGroupsChosen && (
        <Alert severity='warning'>
          Selecione uma perícia em cada grupo acima para continuar.
        </Alert>
      )}

      {/* Section 2: Remaining Skills */}
      {requiredCount > 0 && (
        <>
          <Divider />

          <Typography variant='body1' color='text.secondary'>
            Escolha {requiredCount} perícia{requiredCount > 1 ? 's' : ''}{' '}
            adicional{requiredCount > 1 ? 'is' : ''}:
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
              Você selecionou {selectedSkills.length} perícias, mas só pode
              escolher {requiredCount}.
            </Alert>
          )}

          {!remainingComplete && selectedSkills.length > 0 && (
            <Alert severity='warning'>
              Selecione {requiredCount - selectedSkills.length} perícia
              {requiredCount - selectedSkills.length > 1 ? 's' : ''} adicional
              {requiredCount - selectedSkills.length > 1 ? 'is' : ''} para
              continuar.
            </Alert>
          )}
        </>
      )}

      {isComplete && (
        <Alert severity='success'>
          Perícias selecionadas com sucesso! Você pode continuar para o próximo
          passo.
        </Alert>
      )}
    </Box>
  );
};

export default ClassSkillStep;
