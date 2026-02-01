import React from 'react';
import {
  Box,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { SpellSchool, allSpellSchools } from '@/interfaces/Spells';

interface SpellSchoolSelectionStepProps {
  selectedSchools: SpellSchool[];
  onChange: (schools: SpellSchool[]) => void;
  requiredCount: number;
  className: string;
  spellType: 'Arcane' | 'Divine' | 'Both';
}

// Descriptions for spell schools
const schoolDescriptions: Record<SpellSchool, string> = {
  Abjur:
    'Abjuração - Magias de proteção, barreiras e dissipação de efeitos mágicos.',
  Adiv: 'Adivinhação - Magias que revelam informações, detectam e preveem eventos.',
  Conv: 'Convocação - Magias que invocam criaturas e trazem objetos de outros lugares.',
  Encan: 'Encantamento - Magias que afetam a mente, controlam e influenciam.',
  Evoc: 'Evocação - Magias que manipulam energia e criam efeitos destrutivos.',
  Ilusão: 'Ilusão - Magias que enganam os sentidos e criam imagens falsas.',
  Necro:
    'Necromancia - Magias que manipulam energia vital, morte e mortos-vivos.',
  Trans:
    'Transmutação - Magias que alteram propriedades físicas de objetos e criaturas.',
};

const SpellSchoolSelectionStep: React.FC<SpellSchoolSelectionStepProps> = ({
  selectedSchools,
  onChange,
  requiredCount,
  className,
  spellType,
}) => {
  const handleToggle = (school: SpellSchool) => {
    const isSelected = selectedSchools.includes(school);

    if (isSelected) {
      // Remove school
      onChange(selectedSchools.filter((s) => s !== school));
    } else if (selectedSchools.length < requiredCount) {
      // Add school if under limit
      onChange([...selectedSchools, school]);
    }
  };

  const isComplete = selectedSchools.length === requiredCount;

  // Get spell type description
  const getSpellTypeDescription = (): string => {
    if (spellType === 'Arcane') return 'arcana';
    if (spellType === 'Divine') return 'divina';
    return 'arcana ou divina';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        A classe {className} requer que você escolha {requiredCount} escola
        {requiredCount > 1 ? 's' : ''} de magia {getSpellTypeDescription()}.
        Suas magias devem pertencer a essas escolas.
      </Typography>

      <Typography variant='caption' color='text.secondary'>
        Selecionadas: {selectedSchools.length} / {requiredCount}
      </Typography>

      <Paper sx={{ p: 2 }}>
        <FormControl component='fieldset' fullWidth>
          <FormGroup>
            {allSpellSchools.map((school) => {
              const isSelected = selectedSchools.includes(school);
              const isDisabled =
                !isSelected && selectedSchools.length >= requiredCount;

              return (
                <FormControlLabel
                  key={school}
                  control={
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggle(school)}
                      disabled={isDisabled}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant='body1'>{school}</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {schoolDescriptions[school]}
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 2 }}
                />
              );
            })}
          </FormGroup>
        </FormControl>
      </Paper>

      {!isComplete && selectedSchools.length > 0 && (
        <Alert severity='warning'>
          Selecione {requiredCount - selectedSchools.length} escola
          {requiredCount - selectedSchools.length > 1 ? 's' : ''} adicional
          {requiredCount - selectedSchools.length > 1 ? 'is' : ''} para
          continuar.
        </Alert>
      )}

      {isComplete && (
        <Alert severity='success'>
          Escolas selecionadas com sucesso! Você pode continuar para o próximo
          passo.
        </Alert>
      )}
    </Box>
  );
};

export default SpellSchoolSelectionStep;
