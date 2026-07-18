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
import { DiceRoll } from '@/interfaces/DiceRoll';
import CharacterSheet, {
  SheetActionHistoryEntry,
} from '@/interfaces/CharacterSheet';
import { PowerOriginKind, SheetPower } from '@/functions/powers/powerOrigins';
import type { CustomEffect } from '@/premium/interfaces/CustomEffect';
import PowerDetailBody from './PowerDetailBody';

export interface PowerDetailSheetProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  power: SheetPower | null;
  originKind: PowerOriginKind;
  originLabel: string;
  sheetHistory: SheetActionHistoryEntry[];
  sheet?: CharacterSheet;
  className?: string;
  onUpdateRolls?: (power: SheetPower, newRolls: DiceRoll[]) => void;
  onUpdateCustomEffects?: (
    power: SheetPower,
    newEffects: CustomEffect[]
  ) => void;
  detailExtra?: React.ReactNode;
}

/**
 * Detalhe do poder em bottom sheet no mobile.
 *
 * Segue o mesmo formato do `StatEditDrawer`: anchor responsivo, 85vh de teto e
 * cantos superiores arredondados. Sem "pílula" de arraste — com `Drawer` ela
 * seria uma promessa falsa, já que não arrasta; o fechar é o X e o backdrop.
 *
 * Existe UMA instância no nível da lista, não uma por linha.
 */
const PowerDetailSheet: React.FC<PowerDetailSheetProps> = ({
  open,
  onClose,
  isMobile,
  power,
  originKind,
  originLabel,
  sheetHistory,
  sheet,
  className,
  onUpdateRolls,
  onUpdateCustomEffects,
  detailExtra,
}) => (
  <Drawer
    anchor={isMobile ? 'bottom' : 'right'}
    open={open && !!power}
    onClose={onClose}
    slotProps={{
      paper: {
        sx: {
          width: { xs: '100%', sm: 450 },
          maxHeight: isMobile ? '85vh' : '100%',
          borderTopLeftRadius: 12,
          borderTopRightRadius: isMobile ? 12 : 0,
        },
      },
    }}
  >
    {power && (
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
            <Typography variant='h6' sx={{ overflowWrap: 'anywhere' }}>
              {power.name}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {originLabel}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size='small' aria-label='fechar'>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <PowerDetailBody
          power={power}
          originKind={originKind}
          sheetHistory={sheetHistory}
          sheet={sheet}
          className={className}
          onUpdateRolls={onUpdateRolls}
          onUpdateCustomEffects={onUpdateCustomEffects}
          extra={detailExtra}
        />
      </Box>
    )}
  </Drawer>
);

export default PowerDetailSheet;
