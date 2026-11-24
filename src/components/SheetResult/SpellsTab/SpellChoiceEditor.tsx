import React, { useMemo, useState } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import type { SpellChoiceOf } from '@/interfaces/SpellModifiers';
import type { SpellChoiceOption } from '@/functions/spells/modifiers';
import { getSchoolLabel } from '@/components/SpellPicker/schoolLabels';

interface SpellChoiceEditorProps {
  of: SpellChoiceOf;
  options: SpellChoiceOption[];
  max: number;
  value: string[];
  onChange: (value: string[]) => void;
}

const NOUN: Record<SpellChoiceOf, [string, string]> = {
  spell: ['magia', 'magias'],
  school: ['escola', 'escolas'],
  damageType: ['tipo de dano', 'tipos de dano'],
};

export const spellChoiceNoun = (of: SpellChoiceOf, count: number): string =>
  NOUN[of][count === 1 ? 0 : 1];

const optionLabel = (of: SpellChoiceOf, value: string): string => {
  if (of === 'school') return getSchoolLabel(value);
  if (of === 'damageType')
    return value.charAt(0).toUpperCase() + value.slice(1);
  return value;
};

/** Busca só quando a lista não cabe de relance. */
const SEARCH_THRESHOLD = 8;

const normalize = (text: string): string =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Lista de escolha de "escolha N magias" (Foco em Magia, Tomo hermético,
 * Cetro elemental…): cada valor uma vez, até `max`. Poder repetível dá uma
 * vaga por vez que foi escolhido, então `max` já vem somado.
 */
const SpellChoiceEditor: React.FC<SpellChoiceEditorProps> = ({
  of,
  options,
  max,
  value,
  onChange,
}) => {
  const [query, setQuery] = useState('');
  const full = value.length >= max;

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return options;
    return options.filter(
      (option) =>
        value.includes(option.value) ||
        normalize(optionLabel(of, option.value)).includes(q)
    );
  }, [options, query, value, of]);

  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else if (!full) {
      onChange([...value, optionValue]);
    }
  };

  if (options.length === 0) {
    return (
      <Typography variant='body2' color='text.secondary'>
        Nenhuma {NOUN[of][0]} elegível entre as magias da ficha. Aprenda uma
        magia que se encaixe e volte aqui.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography
        variant='body2'
        sx={{ mb: 1, fontWeight: 600 }}
        color={full ? 'success.main' : 'text.primary'}
      >
        Escolhas: {value.length} de {max}
      </Typography>
      {options.length > SEARCH_THRESHOLD && (
        <TextField
          size='small'
          fullWidth
          placeholder='Buscar'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ mb: 1 }}
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {visible.map((option) => {
          const checked = value.includes(option.value);
          const hint =
            of === 'spell' ? undefined : option.spells.join(', ') || undefined;
          return (
            <FormControlLabel
              key={option.value}
              sx={{ alignItems: hint ? 'flex-start' : 'center', mr: 0 }}
              control={
                <Checkbox
                  size='small'
                  checked={checked}
                  disabled={!checked && full}
                  onChange={() => toggle(option.value)}
                  sx={hint ? { pt: 0.5 } : undefined}
                />
              }
              label={
                <Box>
                  <Typography variant='body2'>
                    {optionLabel(of, option.value)}
                  </Typography>
                  {hint && (
                    <Typography variant='caption' color='text.secondary'>
                      {hint}
                    </Typography>
                  )}
                </Box>
              }
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default SpellChoiceEditor;
