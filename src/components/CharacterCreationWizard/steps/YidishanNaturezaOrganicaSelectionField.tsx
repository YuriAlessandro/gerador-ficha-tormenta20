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

interface YidishanNaturezaOrganicaSelectionFieldProps {
  availableRaces: Race[];
  availableSkills: Skill[];
  availablePowers: GeneralPower[];
  selections: SelectionOptions;
  onChange: (selections: SelectionOptions) => void;
}

type BenefitType = 'skill' | 'power' | 'raceAbility';

const YidishanNaturezaOrganicaSelectionField: React.FC<
  YidishanNaturezaOrganicaSelectionFieldProps
> = ({
  availableRaces,
  availableSkills,
  availablePowers,
  selections,
  onChange,
}) => {
  const selectedOldRaceName = selections.yidishanOldRace || 'Humano';
  const isHumano = selectedOldRaceName === 'Humano';

  const selectedOldRace = useMemo(
    () => availableRaces.find((r) => r.name === selectedOldRaceName),
    [availableRaces, selectedOldRaceName]
  );

  const canPickRaceAbility =
    !isHumano &&
    !!selectedOldRace?.abilities &&
    selectedOldRace.abilities.length > 0;

  const [benefitType, setBenefitType] = useState<BenefitType>(() => {
    if (selections.raceAbilities && selections.raceAbilities.length > 0) {
      return 'raceAbility';
    }
    if (selections.powers && selections.powers.length > 0) {
      return 'power';
    }
    return 'skill';
  });

  useEffect(() => {
    if (selections.raceAbilities && selections.raceAbilities.length > 0) {
      setBenefitType('raceAbility');
    } else if (selections.powers && selections.powers.length > 0) {
      setBenefitType('power');
    } else if (selections.skills && selections.skills.length > 0) {
      setBenefitType('skill');
    }
  }, [selections.skills, selections.powers, selections.raceAbilities]);

  const selectedSkill = selections.skills?.[0] || '';
  const selectedPower = selections.powers?.[0] as GeneralPower | undefined;
  const selectedAbilityName = selections.raceAbilities?.[0]?.abilityName || '';

  const sortedRaces = useMemo(
    () => [...availableRaces].sort((a, b) => a.name.localeCompare(b.name)),
    [availableRaces]
  );

  const sortedPowers = useMemo(
    () => [...availablePowers].sort((a, b) => a.name.localeCompare(b.name)),
    [availablePowers]
  );

  const handleOldRaceChange = (raceName: string) => {
    onChange({
      yidishanOldRace: raceName,
      skills: [],
      powers: [],
      raceAbilities: [],
    });
    setBenefitType('skill');
  };

  const handleBenefitTypeChange = (type: BenefitType) => {
    setBenefitType(type);
    onChange({
      yidishanOldRace: selectedOldRaceName,
      skills: [],
      powers: [],
      raceAbilities: [],
    });
  };

  const handleSkillChange = (skill: string) => {
    onChange({
      yidishanOldRace: selectedOldRaceName,
      skills: [skill],
      powers: [],
      raceAbilities: [],
    });
  };

  const handlePowerChange = (powerName: string) => {
    const power = availablePowers.find((p) => p.name === powerName);
    if (power) {
      onChange({
        yidishanOldRace: selectedOldRaceName,
        skills: [],
        powers: [power],
        raceAbilities: [],
      });
    }
  };

  const handleAbilityChange = (abilityName: string) => {
    onChange({
      yidishanOldRace: selectedOldRaceName,
      skills: [],
      powers: [],
      raceAbilities: [{ raceName: selectedOldRaceName, abilityName }],
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity='info'>
        <Typography variant='body2'>
          <strong>Natureza Orgânica:</strong> Você se torna treinado em uma
          perícia ou recebe um poder geral a sua escolha. Como alternativa, se
          você é um yidishan de uma raça diferente de humano, pode ganhar uma
          habilidade dessa raça a sua escolha.
        </Typography>
      </Alert>

      <FormControl fullWidth>
        <InputLabel id='yidishan-natureza-old-race-label'>
          Raça Anterior *
        </InputLabel>
        <Select
          labelId='yidishan-natureza-old-race-label'
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

      <Box>
        <Typography variant='subtitle1' gutterBottom>
          Benefício
        </Typography>
        <FormControl component='fieldset'>
          <RadioGroup
            row
            value={benefitType}
            onChange={(e) =>
              handleBenefitTypeChange(e.target.value as BenefitType)
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
            {canPickRaceAbility && (
              <FormControlLabel
                value='raceAbility'
                control={<Radio />}
                label={`Habilidade de ${selectedOldRaceName}`}
              />
            )}
          </RadioGroup>
        </FormControl>
      </Box>

      {benefitType === 'skill' && (
        <FormControl fullWidth>
          <InputLabel id='yidishan-natureza-skill-label'>Perícia *</InputLabel>
          <Select
            labelId='yidishan-natureza-skill-label'
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
          <InputLabel id='yidishan-natureza-power-label'>
            Poder Geral *
          </InputLabel>
          <Select
            labelId='yidishan-natureza-power-label'
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

      {benefitType === 'raceAbility' &&
        canPickRaceAbility &&
        selectedOldRace && (
          <Box>
            <Typography variant='subtitle1' gutterBottom>
              Habilidade de {selectedOldRaceName}
            </Typography>
            <FormControl component='fieldset' fullWidth>
              <RadioGroup
                value={selectedAbilityName}
                onChange={(e) => handleAbilityChange(e.target.value)}
              >
                {selectedOldRace.abilities.map((ability) => {
                  const isSelected = selectedAbilityName === ability.name;
                  return (
                    <FormControlLabel
                      key={ability.name}
                      value={ability.name}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant='body1'>
                            {ability.name}
                          </Typography>
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

      <Box sx={{ mt: 1 }}>
        <Typography variant='body2' color='text.secondary'>
          <strong>Resumo:</strong> Raça herdada: <em>{selectedOldRaceName}</em>
          {benefitType === 'skill' && selectedSkill && (
            <>
              {' — '}
              Perícia: <em>{selectedSkill}</em>
            </>
          )}
          {benefitType === 'power' && selectedPower && (
            <>
              {' — '}
              Poder: <em>{selectedPower.name}</em>
            </>
          )}
          {benefitType === 'raceAbility' && selectedAbilityName && (
            <>
              {' — '}
              Habilidade: <em>{selectedAbilityName}</em>
            </>
          )}
          {benefitType === 'skill' &&
            !selectedSkill &&
            ' — Nenhuma selecionada'}
          {benefitType === 'power' && !selectedPower && ' — Nenhum selecionado'}
          {benefitType === 'raceAbility' &&
            !selectedAbilityName &&
            ' — Nenhuma selecionada'}
        </Typography>
      </Box>
    </Box>
  );
};

export default YidishanNaturezaOrganicaSelectionField;
