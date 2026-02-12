import React, { useState, useEffect, useMemo } from 'react';
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

interface DeformidadeSelectionFieldProps {
  availableSkills: Skill[];
  availablePowers: GeneralPower[];
  selections: SelectionOptions;
  onChange: (selections: SelectionOptions) => void;
}

const DeformidadeSelectionField: React.FC<DeformidadeSelectionFieldProps> = ({
  availableSkills,
  availablePowers,
  selections,
  onChange,
}) => {
  // Track the second choice type (skill or tormenta power)
  const [secondChoiceType, setSecondChoiceType] = useState<'skill' | 'power'>(
    () =>
      selections.powers && selections.powers.length > 0 ? 'power' : 'skill'
  );

  // Sync state if selections change externally
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
      onChange({
        ...selections,
        skills: firstSkill ? [firstSkill] : [],
        powers: [],
      });
    } else {
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

  const sortedPowers = useMemo(
    () => [...availablePowers].sort((a, b) => a.name.localeCompare(b.name)),
    [availablePowers]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity='info'>
        <Typography variant='body2'>
          <strong>Deformidade:</strong> Você recebe +2 em duas perícias a sua
          escolha. Cada um desses bônus conta como um poder da Tormenta. Você
          pode trocar um desses bônus por um poder da Tormenta a sua escolha.
          Esta habilidade não causa perda de Carisma.
        </Typography>
      </Alert>

      {/* First Skill Selection (Required) */}
      <FormControl fullWidth>
        <InputLabel id='deformidade-first-skill-label'>
          Primeira Perícia (+2) *
        </InputLabel>
        <Select
          labelId='deformidade-first-skill-label'
          value={firstSkill}
          label='Primeira Perícia (+2) *'
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
              label='Perícia (+2)'
            />
            <FormControlLabel
              value='power'
              control={<Radio />}
              label='Poder da Tormenta'
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Second Skill Selection */}
      {secondChoiceType === 'skill' && (
        <FormControl fullWidth>
          <InputLabel id='deformidade-second-skill-label'>
            Segunda Perícia (+2) *
          </InputLabel>
          <Select
            labelId='deformidade-second-skill-label'
            value={secondSkill}
            label='Segunda Perícia (+2) *'
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

      {/* Power Selection */}
      {secondChoiceType === 'power' && (
        <FormControl fullWidth>
          <InputLabel id='deformidade-power-label'>
            Poder da Tormenta *
          </InputLabel>
          <Select
            labelId='deformidade-power-label'
            value={selectedPower?.name || ''}
            label='Poder da Tormenta *'
            onChange={(e) => handlePowerChange(e.target.value as string)}
            disabled={!firstSkill}
          >
            {sortedPowers.map((power) => (
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
              Perícia: <em>{firstSkill} (+2)</em>
            </>
          )}
          {secondChoiceType === 'skill' && secondSkill && (
            <>
              {' + '}
              Perícia: <em>{secondSkill} (+2)</em>
            </>
          )}
          {secondChoiceType === 'power' && selectedPower && (
            <>
              {' + '}
              Poder da Tormenta: <em>{selectedPower.name}</em>
            </>
          )}
          {!firstSkill && ' Nenhuma seleção ainda'}
        </Typography>
      </Box>
    </Box>
  );
};

export default DeformidadeSelectionField;
