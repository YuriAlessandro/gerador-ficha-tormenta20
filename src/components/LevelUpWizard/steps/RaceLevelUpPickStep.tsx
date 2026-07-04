import React from 'react';
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

/** Uma opção de uma ação `chooseFromOptions`. */
export interface RaceLevelUpPickOption {
  name: string;
  text: string;
  repeatable?: boolean;
}

/** Uma habilidade de raça que concede novas escolhas ao subir de nível. */
export interface RaceLevelUpPick {
  optionKey: string;
  abilityName: string;
  options: RaceLevelUpPickOption[];
  pickPerLevelUp: number;
}

interface RaceLevelUpPickStepProps {
  picks: RaceLevelUpPick[];
  /** Escolhas DESTE nível, indexadas por `optionKey`. */
  value: Record<string, string[]>;
  onChange: (value: Record<string, string[]>) => void;
}

/**
 * Passo do wizard de subida de nível para habilidades de raça (homebrew) que
 * concedem novas escolhas ("picks") por nível. O jogador escolhe
 * `pickPerLevelUp` opções por habilidade; as escolhas são anexadas às já
 * acumuladas em `sheet.optionChoices` pelo motor.
 */
const RaceLevelUpPickStep: React.FC<RaceLevelUpPickStepProps> = ({
  picks,
  value,
  onChange,
}) => {
  const countFor = (optionKey: string, optionName: string): number =>
    (value[optionKey] || []).filter((n) => n === optionName).length;

  const totalFor = (optionKey: string): number =>
    (value[optionKey] || []).length;

  const setChoices = (optionKey: string, next: string[]) => {
    onChange({ ...value, [optionKey]: next });
  };

  const toggleSingle = (
    pick: RaceLevelUpPick,
    optionName: string,
    checked: boolean
  ) => {
    if (checked) {
      const current = value[pick.optionKey] || [];
      if (current.length >= pick.pickPerLevelUp) return;
      setChoices(pick.optionKey, [...current, optionName]);
    } else {
      const current = value[pick.optionKey] || [];
      const idx = current.indexOf(optionName);
      if (idx >= 0) {
        const next = [...current];
        next.splice(idx, 1);
        setChoices(pick.optionKey, next);
      }
    }
  };

  const increment = (pick: RaceLevelUpPick, optionName: string) => {
    const current = value[pick.optionKey] || [];
    if (current.length >= pick.pickPerLevelUp) return;
    setChoices(pick.optionKey, [...current, optionName]);
  };

  const decrement = (pick: RaceLevelUpPick, optionName: string) => {
    const current = value[pick.optionKey] || [];
    const idx = current.lastIndexOf(optionName);
    if (idx >= 0) {
      const next = [...current];
      next.splice(idx, 1);
      setChoices(pick.optionKey, next);
    }
  };

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Novas escolhas de raça
      </Typography>
      <Typography
        variant='body2'
        sx={{
          color: 'text.secondary',
          mb: 2,
        }}
      >
        Sua raça concede novas escolhas ao subir de nível. Selecione abaixo.
      </Typography>
      <Stack spacing={2}>
        {picks.map((pick) => {
          const total = totalFor(pick.optionKey);
          const isMulti =
            pick.pickPerLevelUp > 1 || pick.options.some((o) => o.repeatable);
          const reachedMax = total >= pick.pickPerLevelUp;
          return (
            <Paper key={pick.optionKey} variant='outlined' sx={{ p: 2 }}>
              <Stack
                direction='row'
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                  {pick.abilityName}
                </Typography>
                <Chip
                  size='small'
                  color={reachedMax ? 'success' : 'default'}
                  label={`${total} / ${pick.pickPerLevelUp}`}
                />
              </Stack>
              <Stack spacing={1}>
                {pick.options.map((option) => {
                  const count = countFor(pick.optionKey, option.name);
                  const canAddMore =
                    !reachedMax && (option.repeatable || count === 0);
                  if (isMulti) {
                    return (
                      <Stack
                        key={option.name}
                        direction='row'
                        spacing={1}
                        sx={{
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          p: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: count > 0 ? 'primary.main' : 'divider',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Stack
                            direction='row'
                            spacing={1}
                            sx={{
                              alignItems: 'center',
                            }}
                          >
                            <Typography
                              variant='body2'
                              sx={{ fontWeight: 600 }}
                            >
                              {option.name}
                            </Typography>
                            {option.repeatable && (
                              <Chip
                                size='small'
                                variant='outlined'
                                label='Repetível'
                              />
                            )}
                          </Stack>
                          {option.text && (
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                              }}
                            >
                              {option.text}
                            </Typography>
                          )}
                        </Box>
                        <Stack
                          direction='row'
                          spacing={0.5}
                          sx={{
                            alignItems: 'center',
                          }}
                        >
                          <IconButton
                            size='small'
                            aria-label={`Remover ${option.name}`}
                            disabled={count === 0}
                            onClick={() => decrement(pick, option.name)}
                          >
                            <RemoveIcon fontSize='small' />
                          </IconButton>
                          <Typography
                            variant='body2'
                            sx={{ minWidth: 16, textAlign: 'center' }}
                          >
                            {count}
                          </Typography>
                          <IconButton
                            size='small'
                            aria-label={`Adicionar ${option.name}`}
                            disabled={!canAddMore}
                            onClick={() => increment(pick, option.name)}
                          >
                            <AddIcon fontSize='small' />
                          </IconButton>
                        </Stack>
                      </Stack>
                    );
                  }
                  return (
                    <FormControlLabel
                      key={option.name}
                      control={
                        <Checkbox
                          checked={count > 0}
                          disabled={count === 0 && reachedMax}
                          onChange={(e) =>
                            toggleSingle(pick, option.name, e.target.checked)
                          }
                        />
                      }
                      label={
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {option.name}
                          </Typography>
                          {option.text && (
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                              }}
                            >
                              {option.text}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  );
                })}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

export default RaceLevelUpPickStep;
