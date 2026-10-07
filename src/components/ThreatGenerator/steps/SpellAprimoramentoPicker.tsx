import React, { useMemo } from 'react';
import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CasinoIcon from '@mui/icons-material/Casino';
import {
  isStackableAprimoramento,
  isTruqueAprimoramento,
} from '@/functions/spellRollAugmentation';
import {
  AprimoramentoCounts,
  CompendiumSpell,
  getAprimoradoPmCost,
  getAprimoradoRolls,
  getCompendiumBasePm,
  getRollKey,
  isRollIncluded,
  RollInclusion,
  toAprimoramentoSelections,
} from '../utils/spellCompendium';

interface SpellAprimoramentoPickerProps {
  spell: CompendiumSpell;
  counts: AprimoramentoCounts;
  onChange: (counts: AprimoramentoCounts) => void;
  rollInclusion: RollInclusion;
  onRollInclusionChange: (inclusion: RollInclusion) => void;
}

/**
 * Escolha dos aprimoramentos com que a ameaça usa a magia. Mesmas regras do
 * lançamento na ficha: "aumenta..." acumula, o resto é marca única, e truque
 * zera o custo e não combina com os outros. A prévia mostra o custo e as
 * rolagens que vão ficar gravados; tocar numa rolagem a tira (ou devolve) do
 * clique da mesa.
 */
const SpellAprimoramentoPicker: React.FC<SpellAprimoramentoPickerProps> = ({
  spell,
  counts,
  onChange,
  rollInclusion,
  onRollInclusionChange,
}) => {
  const aprimoramentos = spell.aprimoramentos ?? [];
  const selections = useMemo(
    () => toAprimoramentoSelections(spell, counts),
    [spell, counts]
  );
  const basePm = getCompendiumBasePm(spell);
  const finalPm = getAprimoradoPmCost(spell, selections);
  const rolls = useMemo(
    () => getAprimoradoRolls(spell, selections),
    [spell, selections]
  );

  const hasTruque = selections.some(({ aprimoramento }) =>
    isTruqueAprimoramento(aprimoramento)
  );
  const hasNonTruque = selections.some(
    ({ aprimoramento }) => !isTruqueAprimoramento(aprimoramento)
  );

  const toggleRoll = (key: string, included: boolean) =>
    onRollInclusionChange(new Map(rollInclusion).set(key, !included));

  const setCount = (index: number, count: number) => {
    const next = new Map(counts);
    if (count > 0) next.set(index, count);
    else next.delete(index);
    onChange(next);
  };

  return (
    <Paper variant='outlined' sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Stack
        direction='row'
        spacing={1}
        useFlexGap
        sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1 }}
      >
        <Typography variant='subtitle1' sx={{ fontWeight: 600, mr: 'auto' }}>
          {spell.nome}
        </Typography>
        <Chip
          size='small'
          color={finalPm !== basePm ? 'primary' : 'default'}
          label={
            finalPm !== basePm ? `${basePm} → ${finalPm} PM` : `${finalPm} PM`
          }
        />
      </Stack>

      {rolls.length > 0 && (
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {rolls.map((roll, index) => {
              const key = getRollKey(roll, index);
              const included = isRollIncluded(
                roll,
                index,
                rolls,
                selections,
                rollInclusion
              );
              const changed = roll.isAugmented && roll.baseDice !== roll.dice;
              return (
                <Chip
                  key={key}
                  size='small'
                  icon={<CasinoIcon />}
                  variant={included ? 'filled' : 'outlined'}
                  color={included ? 'primary' : 'default'}
                  onClick={() => toggleRoll(key, included)}
                  aria-pressed={included}
                  sx={
                    included
                      ? undefined
                      : { textDecoration: 'line-through', opacity: 0.7 }
                  }
                  label={
                    changed
                      ? `${roll.label}: ${roll.baseDice} → ${roll.dice}`
                      : `${roll.label}: ${roll.dice}`
                  }
                />
              );
            })}
          </Box>
          {rolls.length > 1 && (
            <Typography
              variant='caption'
              sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
            >
              Toque numa rolagem para incluir ou tirar do clique na mesa.
            </Typography>
          )}
        </Box>
      )}

      {aprimoramentos.length === 0 ? (
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          Esta magia não tem aprimoramentos.
        </Typography>
      ) : (
        aprimoramentos.map((aprimoramento, index) => {
          const count = counts.get(index) ?? 0;
          const truque = isTruqueAprimoramento(aprimoramento);
          const disabled = truque ? hasNonTruque : hasTruque;
          const costText = truque ? 'Truque' : `+${aprimoramento.addPm} PM`;
          const stackable = !truque && isStackableAprimoramento(aprimoramento);
          return (
            <Box
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                p: 1,
                mb: 0.5,
                borderRadius: 1,
                bgcolor: count > 0 ? 'action.selected' : 'transparent',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {stackable ? (
                <Stack
                  direction='row'
                  sx={{ alignItems: 'center', flexShrink: 0 }}
                >
                  <IconButton
                    size='small'
                    aria-label='Diminuir'
                    onClick={() => setCount(index, count - 1)}
                    disabled={count === 0 || disabled}
                  >
                    <RemoveIcon fontSize='small' />
                  </IconButton>
                  <Typography
                    sx={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}
                  >
                    {count}
                  </Typography>
                  <IconButton
                    size='small'
                    aria-label='Aumentar'
                    onClick={() => setCount(index, count + 1)}
                    disabled={disabled}
                  >
                    <AddIcon fontSize='small' />
                  </IconButton>
                </Stack>
              ) : (
                <Checkbox
                  size='small'
                  checked={count > 0}
                  disabled={disabled}
                  onChange={() => setCount(index, count > 0 ? 0 : 1)}
                  sx={{ p: 0.5, flexShrink: 0 }}
                />
              )}
              <Typography variant='body2' sx={{ pt: 0.5 }}>
                <Box
                  component='strong'
                  sx={{ color: 'primary.main', whiteSpace: 'nowrap' }}
                >
                  {count > 1 ? `${count}× (${costText})` : costText}:
                </Box>{' '}
                {aprimoramento.text}
              </Typography>
            </Box>
          );
        })
      )}
      {hasTruque && (
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          Truques não podem ser combinados com outros aprimoramentos.
        </Typography>
      )}
    </Paper>
  );
};

export default SpellAprimoramentoPicker;
