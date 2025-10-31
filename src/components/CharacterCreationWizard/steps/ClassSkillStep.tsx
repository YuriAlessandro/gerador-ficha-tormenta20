import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Chip,
  SelectChangeEvent,
  OutlinedInput,
} from '@mui/material';
import Skill from '@/interfaces/Skills';

interface ClassSkillStepProps {
  availableSkills: Skill[];
  selectedSkills: Skill[];
  onChange: (skills: Skill[]) => void;
  requiredCount: number;
  className: string;
}

const ClassSkillStep: React.FC<ClassSkillStepProps> = ({
  availableSkills,
  selectedSkills,
  onChange,
  requiredCount,
  className,
}) => {
  const handleChange = (event: SelectChangeEvent<typeof selectedSkills>) => {
    const {
      target: { value },
    } = event;
    const newSkills =
      typeof value === 'string' ? (value.split(',') as Skill[]) : value;

    // Limit to requiredCount
    if (newSkills.length <= requiredCount) {
      onChange(newSkills);
    }
  };

  const isComplete = (): boolean => selectedSkills.length === requiredCount;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant='body1' color='text.secondary'>
        A classe {className} permite escolher {requiredCount} perícia
        {requiredCount > 1 ? 's' : ''} entre as seguintes opções:
      </Typography>

      <FormControl fullWidth>
        <InputLabel id='skills-label'>Perícias</InputLabel>
        <Select
          labelId='skills-label'
          id='skills-select'
          multiple
          value={selectedSkills}
          onChange={handleChange}
          input={<OutlinedInput label='Perícias' />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size='small' />
              ))}
            </Box>
          )}
        >
          {availableSkills.map((skill) => (
            <MenuItem
              key={skill}
              value={skill}
              disabled={
                !selectedSkills.includes(skill) &&
                selectedSkills.length >= requiredCount
              }
            >
              {skill}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant='caption' color='text.secondary'>
        Selecionadas: {selectedSkills.length} / {requiredCount}
      </Typography>

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

export default ClassSkillStep;
