import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from '@mui/material';
import Skill from '@/interfaces/Skills';
import { SelectionOptions } from '@/interfaces/PowerSelections';
import { GeneralPower } from '@/interfaces/Poderes';

interface VersatilSelectionFieldProps {
  availableSkills: Skill[];
  availablePowers: GeneralPower[];
  selections: SelectionOptions;
  onChange: (selections: SelectionOptions) => void;
}

const VersatilSelectionField: React.FC<VersatilSelectionFieldProps> = ({
  availableSkills,
  availablePowers,
  selections,
  onChange,
}) => {
  // Use local state to track the second choice type
  // Initialize based on current selections (power if there's a power selected)
  const [secondChoiceType, setSecondChoiceType] = useState<'skill' | 'power'>(
    () =>
      selections.powers && selections.powers.length > 0 ? 'power' : 'skill'
  );

  // Sync state if selections change externally (e.g., when navigating back)
  useEffect(() => {
    if (selections.powers && selections.powers.length > 0) {
      setSecondChoiceType('power');
    }
  }, [selections.powers]);

  // Get current selections
  const firstSkill = selections.skills?.[0] || '';
  const secondSkill = selections.skills?.[1] || '';
  const selectedPower = selections.powers?.[0] as GeneralPower | undefined;

  // Filter out the first skill from second skill options
  const secondSkillOptions = availableSkills.filter(
    (skill) => skill !== firstSkill
  );

  const handleFirstSkillChange = (skill: string) => {
    // If the second skill is the same as the new first skill, clear it
    const newSecondSkill = secondSkill === skill ? '' : secondSkill;

    if (secondChoiceType === 'skill') {
      onChange({
        ...selections,
        skills: newSecondSkill ? [skill, newSecondSkill] : [skill],
        powers: [],
      });
    } else {
      onChange({
        ...selections,
        skills: [skill],
        powers: selections.powers,
      });
    }
  };

  const handleSecondChoiceTypeChange = (type: 'skill' | 'power') => {
    setSecondChoiceType(type);
    if (type === 'skill') {
      // Switching to skill - clear power selection
      onChange({
        ...selections,
        skills: firstSkill ? [firstSkill] : [],
        powers: [],
      });
    } else {
      // Switching to power - clear second skill
      onChange({
        ...selections,
        skills: firstSkill ? [firstSkill] : [],
        powers: [],
      });
    }
  };

  const handleSecondSkillChange = (skill: string) => {
    onChange({
      ...selections,
      skills: firstSkill ? [firstSkill, skill] : [skill],
      powers: [],
    });
  };

  const handlePowerChange = (powerName: string) => {
    const power = availablePowers.find((p) => p.name === powerName);
    if (power) {
      onChange({
        ...selections,
        skills: firstSkill ? [firstSkill] : [],
        powers: [power],
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity='info'>
        <Typography variant='body2'>
          <strong>Versátil:</strong> Você se torna treinado em duas perícias a
          sua escolha (não precisam ser da sua classe). Você pode trocar uma
          dessas perícias por um poder geral a sua escolha.
        </Typography>
      </Alert>

      {/* First Skill Selection (Required) */}
      <FormControl fullWidth>
        <InputLabel id='versatil-first-skill-label'>
          Primeira Perícia *
        </InputLabel>
        <Select
          labelId='versatil-first-skill-label'
          value={firstSkill}
          label='Primeira Perícia *'
          onChange={(e) => handleFirstSkillChange(e.target.value as string)}
        >
          {availableSkills.map((skill) => (
            <MenuItem key={skill} value={skill}>
              {skill}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Second Choice Type Selection */}
      <Box>
        <Typography variant='subtitle1' gutterBottom>
          Segunda Escolha
        </Typography>
        <FormControl component='fieldset'>
          <RadioGroup
            row
            value={secondChoiceType}
            onChange={(e) =>
              handleSecondChoiceTypeChange(e.target.value as 'skill' | 'power')
            }
          >
            <FormControlLabel
              value='skill'
              control={<Radio />}
              label='Perícia'
            />
            <FormControlLabel
              value='power'
              control={<Radio />}
              label='Poder Geral'
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Second Skill Selection (if skill type) */}
      {secondChoiceType === 'skill' && (
        <FormControl fullWidth>
          <InputLabel id='versatil-second-skill-label'>
            Segunda Perícia *
          </InputLabel>
          <Select
            labelId='versatil-second-skill-label'
            value={secondSkill}
            label='Segunda Perícia *'
            onChange={(e) => handleSecondSkillChange(e.target.value as string)}
            disabled={!firstSkill}
          >
            {secondSkillOptions.map((skill) => (
              <MenuItem key={skill} value={skill}>
                {skill}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Power Selection (if power type) */}
      {secondChoiceType === 'power' && (
        <FormControl fullWidth>
          <InputLabel id='versatil-power-label'>Poder Geral *</InputLabel>
          <Select
            labelId='versatil-power-label'
            value={selectedPower?.name || ''}
            label='Poder Geral *'
            onChange={(e) => handlePowerChange(e.target.value as string)}
            disabled={!firstSkill}
          >
            {availablePowers.map((power) => (
              <MenuItem key={power.name} value={power.name}>
                <Box>
                  <Typography>{power.name}</Typography>
                  {power.description && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      component='div'
                    >
                      {power.description.length > 100
                        ? `${power.description.substring(0, 100)}...`
                        : power.description}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Selection Summary */}
      <Box sx={{ mt: 1 }}>
        <Typography variant='body2' color='text.secondary'>
          <strong>Resumo:</strong>
          {firstSkill && (
            <>
              {' '}
              Perícia: <em>{firstSkill}</em>
            </>
          )}
          {secondChoiceType === 'skill' && secondSkill && (
            <>
              {' + '}
              Perícia: <em>{secondSkill}</em>
            </>
          )}
          {secondChoiceType === 'power' && selectedPower && (
            <>
              {' + '}
              Poder: <em>{selectedPower.name}</em>
            </>
          )}
          {!firstSkill && ' Nenhuma seleção ainda'}
        </Typography>
      </Box>
    </Box>
  );
};

export default VersatilSelectionField;
