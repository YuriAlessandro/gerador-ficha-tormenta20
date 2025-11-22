import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Stack,
  Chip,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import { DiceRoll, RollResult } from '@/interfaces/DiceRoll';
import { executeMultipleDiceRolls, formatRollResult } from '@/utils/diceRoller';

interface RollButtonProps {
  rolls: DiceRoll[];
  label?: string;
  disabled?: boolean;
  iconOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  onRollComplete?: (results: RollResult[]) => void;
}

const RollButton: React.FC<RollButtonProps> = ({
  rolls,
  label = 'Rolar',
  disabled = false,
  iconOnly = false,
  size = 'small',
  onRollComplete,
}) => {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<RollResult[]>([]);

  const handleRoll = () => {
    const rollResults = executeMultipleDiceRolls(rolls);
    setResults(rollResults);
    setOpen(true);

    if (onRollComplete) {
      onRollComplete(rollResults);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleReroll = () => {
    handleRoll();
  };

  if (rolls.length === 0) {
    return null;
  }

  return (
    <>
      {iconOnly ? (
        <IconButton
          size={size}
          onClick={handleRoll}
          disabled={disabled}
          color='primary'
          title='Rolar dados'
        >
          <CasinoIcon />
        </IconButton>
      ) : (
        <Button
          size={size}
          startIcon={<CasinoIcon />}
          onClick={handleRoll}
          disabled={disabled}
          variant='outlined'
        >
          {label}
        </Button>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Stack direction='row' alignItems='center' spacing={1}>
            <CasinoIcon />
            <Typography variant='h6'>Resultados das Rolagens</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {results.map((result, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Box key={index}>
                <Typography variant='subtitle1' fontWeight='bold'>
                  {result.label}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 0.5 }}
                >
                  {formatRollResult(result)}
                </Typography>
                <Chip
                  label={`Total: ${result.total}`}
                  color='primary'
                  size='small'
                />
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReroll} startIcon={<CasinoIcon />}>
            Rolar Novamente
          </Button>
          <Button onClick={handleClose} variant='contained'>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RollButton;
