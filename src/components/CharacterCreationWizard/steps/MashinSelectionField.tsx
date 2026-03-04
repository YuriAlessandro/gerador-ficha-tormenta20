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
import CharacterSheet from '@/interfaces/CharacterSheet';
import { isPowerAvailable } from '@/functions/powers';

interface MashinSelectionFieldProps {
  availableSkills: Skill[];
  availableMarvels: GeneralPower[];
  sheet: CharacterSheet;
  selections: SelectionOptions;
  onChange: (selections: SelectionOptions) => void;
}

const MashinSelectionField: React.FC<MashinSelectionFieldProps> = ({
  availableSkills,
  availableMarvels,
  sheet,
  selections,
  onChange,
}) => {
  const [secondChoiceType, setSecondChoiceType] = useState<'skill' | 'marvel'>(
    () =>
      selections.powers && selections.powers.length > 0 ? 'marvel' : 'skill'
  );

  useEffect(() => {
    if (selections.powers && selections.powers.length > 0) {
      setSecondChoiceType('marvel');
    }
  }, [selections.powers]);

  const firstSkill = selections.skills?.[0] || '';
  const secondSkill = selections.skills?.[1] || '';
  const selectedMarvel = selections.powers?.[0] as GeneralPower | undefined;

  const secondSkillOptions = availableSkills.filter(
    (skill) => skill !== firstSkill
  );

  const filteredMarvels = useMemo(() => {
    const existing = sheet.generalPowers || [];
    return availableMarvels
      .filter((marvel) => {
        if (existing.some((ep) => ep.name === marvel.name)) {
          return false;
        }
        return isPowerAvailable(sheet, marvel);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [availableMarvels, sheet]);

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

  const handleSecondChoiceTypeChange = (type: 'skill' | 'marvel') => {
    setSecondChoiceType(type);
    onChange({
      ...selections,
      skills: firstSkill ? [firstSkill] : [],
      powers: [],
    });
  };

  const handleSecondSkillChange = (skill: string) => {
    onChange({
      ...selections,
      skills: firstSkill ? [firstSkill, skill] : [skill],
      powers: [],
    });
  };

  const handleMarvelChange = (marvelName: string) => {
    const marvel = filteredMarvels.find((m) => m.name === marvelName);
    if (marvel) {
      onChange({
        ...selections,
        skills: firstSkill ? [firstSkill] : [],
        powers: [marvel],
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity='info'>
        <Typography variant='body2'>
          <strong>Chassi Mashin:</strong> Você se torna treinado em duas
          perícias a sua escolha e pode substituir uma dessas perícias por uma
          maravilha mecânica.
        </Typography>
      </Alert>

      {/* First Skill Selection (Required) */}
      <FormControl fullWidth>
        <InputLabel id='mashin-first-skill-label'>
          Primeira Perícia *
        </InputLabel>
        <Select
          labelId='mashin-first-skill-label'
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
              handleSecondChoiceTypeChange(e.target.value as 'skill' | 'marvel')
            }
          >
            <FormControlLabel
              value='skill'
              control={<Radio />}
              label='Perícia'
            />
            <FormControlLabel
              value='marvel'
              control={<Radio />}
              label='Maravilha Mecânica'
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Second Skill Selection */}
      {secondChoiceType === 'skill' && (
        <FormControl fullWidth>
          <InputLabel id='mashin-second-skill-label'>
            Segunda Perícia *
          </InputLabel>
          <Select
            labelId='mashin-second-skill-label'
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

      {/* Mechanical Marvel Selection */}
      {secondChoiceType === 'marvel' && (
        <FormControl fullWidth>
          <InputLabel id='mashin-marvel-label'>Maravilha Mecânica *</InputLabel>
          <Select
            labelId='mashin-marvel-label'
            value={selectedMarvel?.name || ''}
            label='Maravilha Mecânica *'
            onChange={(e) => handleMarvelChange(e.target.value as string)}
            disabled={!firstSkill}
          >
            {filteredMarvels.map((marvel) => (
              <MenuItem key={marvel.name} value={marvel.name}>
                <Box>
                  <Typography>{marvel.name}</Typography>
                  {marvel.description && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      component='div'
                    >
                      {marvel.description.length > 100
                        ? `${marvel.description.substring(0, 100)}...`
                        : marvel.description}
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
          {secondChoiceType === 'marvel' && selectedMarvel && (
            <>
              {' + '}
              Maravilha Mecânica: <em>{selectedMarvel.name}</em>
            </>
          )}
          {!firstSkill && ' Nenhuma seleção ainda'}
        </Typography>
      </Box>
    </Box>
  );
};

export default MashinSelectionField;
