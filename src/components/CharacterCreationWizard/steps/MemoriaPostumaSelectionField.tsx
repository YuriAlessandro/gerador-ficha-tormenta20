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
import Race from '@/interfaces/Race';

interface MemoriaPostumaSelectionFieldProps {
  availableRaces: Race[];
  availableSkills: Skill[];
  availablePowers: GeneralPower[];
  selections: SelectionOptions;
  onChange: (selections: SelectionOptions) => void;
}

const MemoriaPostumaSelectionField: React.FC<
  MemoriaPostumaSelectionFieldProps
> = ({
  availableRaces,
  availableSkills,
  availablePowers,
  selections,
  onChange,
}) => {
  // Track selected old race
  const selectedOldRaceName = selections.osteonOldRace || 'Humano';

  // Track benefit type for Humano path
  const [benefitType, setBenefitType] = useState<'skill' | 'power'>(() =>
    selections.powers && selections.powers.length > 0 ? 'power' : 'skill'
  );

  // Sync benefit type if selections change externally
  useEffect(() => {
    if (selections.powers && selections.powers.length > 0) {
      setBenefitType('power');
    }
  }, [selections.powers]);

  // Get the resolved old race object
  const selectedOldRace = useMemo(
    () => availableRaces.find((r) => r.name === selectedOldRaceName),
    [availableRaces, selectedOldRaceName]
  );

  const isHumano = selectedOldRaceName === 'Humano';

  // Get current selections
  const selectedSkill = selections.skills?.[0] || '';
  const selectedPower = selections.powers?.[0] as GeneralPower | undefined;
  const selectedAbility = selections.raceAbilities?.[0]?.abilityName || '';

  // Sort races and powers alphabetically
  const sortedRaces = useMemo(
    () => [...availableRaces].sort((a, b) => a.name.localeCompare(b.name)),
    [availableRaces]
  );

  const sortedPowers = useMemo(
    () => [...availablePowers].sort((a, b) => a.name.localeCompare(b.name)),
    [availablePowers]
  );

  const handleOldRaceChange = (raceName: string) => {
    // Reset benefit selections when old race changes
    onChange({
      osteonOldRace: raceName,
      skills: [],
      powers: [],
      raceAbilities: [],
    });
    setBenefitType('skill');
  };

  const handleBenefitTypeChange = (type: 'skill' | 'power') => {
    setBenefitType(type);
    onChange({
      ...selections,
      osteonOldRace: selectedOldRaceName,
      skills: [],
      powers: [],
      raceAbilities: [],
    });
  };

  const handleSkillChange = (skill: string) => {
    onChange({
      osteonOldRace: selectedOldRaceName,
      skills: [skill],
      powers: [],
      raceAbilities: [],
    });
  };

  const handlePowerChange = (powerName: string) => {
    const power = availablePowers.find((p) => p.name === powerName);
    if (power) {
      onChange({
        osteonOldRace: selectedOldRaceName,
        skills: [],
        powers: [power],
        raceAbilities: [],
      });
    }
  };

  const handleAbilityChange = (abilityName: string) => {
    onChange({
      osteonOldRace: selectedOldRaceName,
      skills: [],
      powers: [],
      raceAbilities: [{ raceName: selectedOldRaceName, abilityName }],
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity='info'>
        <Typography variant='body2'>
          <strong>Memória Póstuma:</strong> Você se torna treinado em uma
          perícia ou recebe um poder geral a sua escolha. Como alternativa, você
          pode ser um osteon de outra raça humanoide que não humano. Neste caso,
          você ganha uma habilidade dessa raça a sua escolha.
        </Typography>
      </Alert>

      {/* Old Race Selection */}
      <FormControl fullWidth>
        <InputLabel id='memoria-postuma-old-race-label'>
          Raça Anterior *
        </InputLabel>
        <Select
          labelId='memoria-postuma-old-race-label'
          value={selectedOldRaceName}
          label='Raça Anterior *'
          onChange={(e) => handleOldRaceChange(e.target.value as string)}
        >
          {sortedRaces.map((race) => (
            <MenuItem key={race.name} value={race.name}>
              {race.name}
              {race.size && race.size.name !== 'Médio'
                ? ` (${race.size.name})`
                : ''}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Humano Path: Skill or Power */}
      {isHumano && (
        <>
          <Box>
            <Typography variant='subtitle1' gutterBottom>
              Benefício
            </Typography>
            <FormControl component='fieldset'>
              <RadioGroup
                row
                value={benefitType}
                onChange={(e) =>
                  handleBenefitTypeChange(e.target.value as 'skill' | 'power')
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

          {benefitType === 'skill' && (
            <FormControl fullWidth>
              <InputLabel id='memoria-postuma-skill-label'>
                Perícia *
              </InputLabel>
              <Select
                labelId='memoria-postuma-skill-label'
                value={selectedSkill}
                label='Perícia *'
                onChange={(e) => handleSkillChange(e.target.value as string)}
              >
                {availableSkills.map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    {skill}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {benefitType === 'power' && (
            <FormControl fullWidth>
              <InputLabel id='memoria-postuma-power-label'>
                Poder Geral *
              </InputLabel>
              <Select
                labelId='memoria-postuma-power-label'
                value={selectedPower?.name || ''}
                label='Poder Geral *'
                onChange={(e) => handlePowerChange(e.target.value as string)}
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
        </>
      )}

      {/* Non-Humano Path: Race Ability Selection */}
      {!isHumano && selectedOldRace && (
        <Box>
          <Typography variant='subtitle1' gutterBottom>
            Habilidade de {selectedOldRaceName}
          </Typography>
          <FormControl component='fieldset' fullWidth>
            <RadioGroup
              value={selectedAbility}
              onChange={(e) => handleAbilityChange(e.target.value)}
            >
              {selectedOldRace.abilities.map((ability) => {
                const isSelected = selectedAbility === ability.name;
                return (
                  <FormControlLabel
                    key={ability.name}
                    value={ability.name}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant='body1'>{ability.name}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {ability.description}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      ml: 0,
                      py: 1,
                      px: 1,
                      borderRadius: 1,
                      transition: 'background-color 0.2s',
                      ...(isSelected && {
                        bgcolor: 'action.selected',
                        borderLeft: 3,
                        borderColor: 'primary.main',
                      }),
                    }}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
        </Box>
      )}

      {!isHumano && !selectedOldRace && (
        <Alert severity='warning'>
          Raça selecionada não encontrada. Selecione outra raça.
        </Alert>
      )}

      {/* Selection Summary */}
      <Box sx={{ mt: 1 }}>
        <Typography variant='body2' color='text.secondary'>
          <strong>Resumo:</strong> Raça anterior: <em>{selectedOldRaceName}</em>
          {isHumano && benefitType === 'skill' && selectedSkill && (
            <>
              {' — '}
              Perícia: <em>{selectedSkill}</em>
            </>
          )}
          {isHumano && benefitType === 'power' && selectedPower && (
            <>
              {' — '}
              Poder: <em>{selectedPower.name}</em>
            </>
          )}
          {!isHumano && selectedAbility && (
            <>
              {' — '}
              Habilidade: <em>{selectedAbility}</em>
            </>
          )}
          {isHumano &&
            !selectedSkill &&
            !selectedPower &&
            ' — Nenhum benefício selecionado'}
          {!isHumano && !selectedAbility && ' — Nenhuma habilidade selecionada'}
        </Typography>
      </Box>
    </Box>
  );
};

export default MemoriaPostumaSelectionField;
