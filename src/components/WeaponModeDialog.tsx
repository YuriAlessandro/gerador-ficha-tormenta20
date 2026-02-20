import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';

interface WeaponModeDialogProps {
  open: boolean;
  onClose: () => void;
  weaponName: string;
  damageOptions: string[];
  onSelect: (selectedDamage: string) => void;
}

const WeaponModeDialog: React.FC<WeaponModeDialogProps> = ({
  open,
  onClose,
  weaponName,
  damageOptions,
  onSelect,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
    <DialogTitle>
      <Stack direction='row' alignItems='center' spacing={1}>
        <CasinoIcon color='primary' />
        <Typography variant='h6' component='span'>
          {weaponName}
        </Typography>
      </Stack>
    </DialogTitle>
    <DialogContent>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        Esta arma possui mais de um tipo de ataque. Escolha qual deseja rolar:
      </Typography>
      <Stack spacing={1.5}>
        {damageOptions.map((damage) => (
          <Button
            key={damage}
            variant='outlined'
            fullWidth
            onClick={() => onSelect(damage)}
            sx={{ textTransform: 'none', py: 1.5 }}
          >
            <Typography fontWeight='bold' fontSize={18}>
              {damage}
            </Typography>
          </Button>
        ))}
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
    </DialogActions>
  </Dialog>
);

export default WeaponModeDialog;
