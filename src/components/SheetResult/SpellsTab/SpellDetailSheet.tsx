import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Spell } from '@/interfaces/Spells';
import SpellDetailBody from './SpellDetailBody';
import SpellMetaLine from './SpellMetaLine';
import SpellSchoolGlyph from './SpellSchoolGlyph';

export interface SpellDetailSheetProps {
  open: boolean;
  onClose: () => void;
  compact: boolean;
  spell: Spell | null;
  onCast?: () => void;
}

/**
 * Detalhe da magia em bottom sheet no compacto.
 *
 * Mesmo formato do `PowerDetailSheet`: anchor responsivo, 85vh de teto e cantos
 * superiores arredondados. Existe UMA instância no nível da lista, não uma por
 * linha.
 *
 * A meta-line se repete aqui no cabeçalho de propósito: no compacto a linha da
 * magia fica atrás do sheet, então sem ela o jogador perderia execução e alcance
 * justamente no momento de decidir se conjura.
 */
const SpellDetailSheet: React.FC<SpellDetailSheetProps> = ({
  open,
  onClose,
  compact,
  spell,
  onCast,
}) => (
  <Drawer
    anchor={compact ? 'bottom' : 'right'}
    open={open && !!spell}
    onClose={onClose}
    slotProps={{
      paper: {
        sx: {
          width: { xs: '100%', sm: 450 },
          maxHeight: compact ? '85vh' : '100%',
          borderTopLeftRadius: 12,
          borderTopRightRadius: compact ? 12 : 0,
        },
      },
    }}
  >
    {spell && (
      <Box sx={{ p: 3, overflowY: 'auto' }}>
        <Stack
          direction='row'
          sx={{
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1,
            mb: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction='row'
              sx={{ alignItems: 'center', gap: 0.75, mb: 0.5 }}
            >
              <SpellSchoolGlyph school={spell.school} size={20} />
              <Typography variant='h6' sx={{ overflowWrap: 'anywhere' }}>
                {spell.nome}
              </Typography>
            </Stack>
            <SpellMetaLine spell={spell} />
          </Box>
          <IconButton onClick={onClose} size='small' aria-label='fechar'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <SpellDetailBody spell={spell} onCast={onCast} />
      </Box>
    )}
  </Drawer>
);

export default SpellDetailSheet;
