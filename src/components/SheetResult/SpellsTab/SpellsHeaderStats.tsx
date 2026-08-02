import React from 'react';
import {
  Box,
  Chip,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { CharacterAttribute } from '@/interfaces/Character';

// Todos os 6 atributos podem ser atributo-chave de magia: além dos mentais
// (Int/Sab/Car) usados pelas classes padrão, poderes como Tradição Perdida
// Aprimorada permitem escolher Força, Destreza ou Constituição.
const SPELL_KEY_ATTRIBUTES = Object.values(Atributo);

const STRIP_SX = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 1.5,
  rowGap: 1,
  mb: 1.5,
} as const;

const STAT_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  flexShrink: 0,
} as const;

const LABEL_SX = {
  color: 'text.secondary',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  fontWeight: 700,
} as const;

const VALUE_SX = { fontWeight: 700, fontSize: '0.95rem' } as const;

export interface SpellsHeaderStatsProps {
  keyAttr: CharacterAttribute | null;
  selectedKeyAttribute: Atributo;
  onKeyAttributeChange?: (newAttr: Atributo) => void;
  resistance: number;
  bonusSpellDC: number;
  isMago?: boolean;
  memorizedCount: number;
  memorizedLimit: number;
  alwaysPreparedCount: number;
}

/**
 * A faixa de números da aba: atributo-chave, modificador e CD.
 *
 * Substitui a `div.speelsInfos`, que era CSS solto de 2020 (com o typo no nome
 * da classe) e não acompanhava o tema. Agora é MUI, então herda cor, tipografia
 * e espaçamento como o resto da ficha.
 */
const SpellsHeaderStats: React.FC<SpellsHeaderStatsProps> = ({
  keyAttr,
  selectedKeyAttribute,
  onKeyAttributeChange,
  resistance,
  bonusSpellDC,
  isMago,
  memorizedCount,
  memorizedLimit,
  alwaysPreparedCount,
}) => {
  const mod = keyAttr ? keyAttr.value : 0;

  return (
    <Box sx={STRIP_SX}>
      <Box sx={STAT_SX}>
        <Typography component='span' sx={LABEL_SX}>
          Atributo-chave
        </Typography>
        {onKeyAttributeChange ? (
          <Select
            value={selectedKeyAttribute}
            onChange={(e: SelectChangeEvent) =>
              onKeyAttributeChange(e.target.value as Atributo)
            }
            size='small'
            variant='standard'
            sx={{ fontSize: '0.95rem', fontWeight: 700, minWidth: 90 }}
          >
            {SPELL_KEY_ATTRIBUTES.map((attr) => (
              <MenuItem key={attr} value={attr}>
                {attr}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Typography component='span' sx={VALUE_SX}>
            {keyAttr?.name}
          </Typography>
        )}
      </Box>

      <Box sx={STAT_SX}>
        <Typography component='span' sx={LABEL_SX}>
          Modificador
        </Typography>
        <Typography component='span' sx={VALUE_SX}>
          {mod > 0 ? '+' : ''}
          {mod}
        </Typography>
      </Box>

      <Tooltip
        title={`10 + metade do nível + atributo-chave${
          bonusSpellDC ? ` + ${bonusSpellDC} de bônus` : ''
        }`}
        arrow
      >
        <Box sx={{ ...STAT_SX, cursor: 'help' }}>
          <Typography component='span' sx={LABEL_SX}>
            CD
          </Typography>
          <Typography component='span' sx={VALUE_SX}>
            {resistance}
          </Typography>
        </Box>
      </Tooltip>

      {isMago && (
        <Stack direction='row' sx={{ gap: 0.75, flexWrap: 'wrap' }}>
          <Chip
            label={`Memorizadas: ${memorizedCount} / ${memorizedLimit}`}
            color={memorizedCount > memorizedLimit ? 'error' : 'primary'}
            size='small'
            variant='outlined'
          />
          {alwaysPreparedCount > 0 && (
            <Chip
              label={`Sempre preparadas: ${alwaysPreparedCount}`}
              color='warning'
              size='small'
              variant='outlined'
            />
          )}
        </Stack>
      )}
    </Box>
  );
};

export default SpellsHeaderStats;
