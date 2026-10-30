import React from 'react';
import {
  Box,
  Checkbox,
  Drawer,
  FormControlLabel,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ManeuverId } from '@/interfaces/CharacterSheet';
import { MANEUVERS } from '@/functions/maneuvers';

interface ManeuversDrawerProps {
  open: boolean;
  onClose: () => void;
  enabledIds: ManeuverId[];
  onToggle: (id: ManeuverId) => void;
  /** Bônus de cada manobra com a arma atual ou padrão. */
  bonuses: Partial<Record<ManeuverId, number>>;
}

const formatBonus = (value = 0): string =>
  value >= 0 ? `+${value}` : `${value}`;

const ManeuversDrawer: React.FC<ManeuversDrawerProps> = ({
  open,
  onClose,
  enabledIds,
  onToggle,
  bonuses,
}) => (
  <Drawer
    anchor='right'
    open={open}
    onClose={onClose}
    slotProps={{
      paper: {
        sx: { width: { xs: '100%', sm: 450 } },
      },
    }}
  >
    <Box sx={{ p: 3 }}>
      <Stack
        direction='row'
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='h6'>Manobras de combate</Typography>
        <IconButton onClick={onClose} size='small' aria-label='Fechar'>
          <CloseIcon />
        </IconButton>
      </Stack>
      <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
        As manobras ativadas aparecem na lista de ataques. O teste é um ataque
        corpo a corpo oposto, com a arma escolhida em cada linha.
      </Typography>
      <Stack spacing={1.5}>
        {MANEUVERS.map((maneuver) => (
          <Box key={maneuver.id}>
            <FormControlLabel
              label={`${maneuver.name} (${formatBonus(bonuses[maneuver.id])})`}
              control={
                <Checkbox
                  checked={enabledIds.includes(maneuver.id)}
                  onChange={() => onToggle(maneuver.id)}
                />
              }
            />
            <Typography
              variant='caption'
              sx={{ display: 'block', color: 'text.secondary' }}
            >
              {maneuver.description}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  </Drawer>
);

export default ManeuversDrawer;
