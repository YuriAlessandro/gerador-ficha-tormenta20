import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import HotelIcon from '@mui/icons-material/Hotel';
import EditIcon from '@mui/icons-material/Edit';

interface StatControlProps {
  type: 'PV' | 'PM';
  current: number;
  max: number;
  calculatedMax: number;
  increment: number;
  temp: number;
  onUpdateCurrent: (newCurrent: number) => void;
  onUpdateIncrement: (newIncrement: number) => void;
  onDecrement: (amount: number) => void;
  onHeal: (amount: number) => void;
  onOpenDrawer?: () => void;
  disabled?: boolean;
}

const StatControl: React.FC<StatControlProps> = ({
  type,
  current,
  max,
  calculatedMax,
  increment,
  temp,
  onUpdateCurrent,
  onUpdateIncrement,
  onDecrement,
  onHeal,
  onOpenDrawer,
  disabled = false,
}) => {
  const theme = useTheme();

  const hasTemp = temp > 0;

  // Calculate PV minimum (only for PV, not PM)
  const pvMinimo = type === 'PV' ? Math.min(-10, -Math.floor(max / 2)) : 0;

  // Character states
  const isNegative = type === 'PV' && current < 0;
  const isUnconscious = type === 'PV' && current <= 0 && current > pvMinimo;
  const isDead = type === 'PV' && current <= pvMinimo;

  // Calculate percentage for circular progress
  const percentage =
    max > 0 ? Math.max(0, Math.min((current / max) * 100, 100)) : 0;

  // Colors
  const normalColor =
    type === 'PV' ? theme.palette.success.main : theme.palette.info.main;
  const normalDarkColor =
    type === 'PV' ? theme.palette.success.dark : theme.palette.info.dark;
  const tempColor = theme.palette.warning.main;
  const negativeColor = theme.palette.error.main;
  const deadColor = theme.palette.grey[500];

  const getColor = () => {
    if (isDead) return deadColor;
    if (isNegative) return negativeColor;
    return normalColor;
  };

  const color = getColor();

  // Local state for inputs
  const [incrementInputValue, setIncrementInputValue] = useState(
    String(increment)
  );
  const [amountInputValue, setAmountInputValue] = useState('');

  useEffect(() => {
    setIncrementInputValue(String(increment));
  }, [increment]);

  const handleIncrementChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;
      if (inputValue !== '' && !/^\d*$/.test(inputValue)) {
        return;
      }
      setIncrementInputValue(inputValue);
      const numValue = parseInt(inputValue, 10);
      if (!Number.isNaN(numValue) && numValue >= 1) {
        onUpdateIncrement(numValue);
      }
    },
    [onUpdateIncrement]
  );

  const handleAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;
      if (inputValue !== '' && !/^\d*$/.test(inputValue)) {
        return;
      }
      setAmountInputValue(inputValue);
    },
    []
  );

  const handleIncrementClick = useCallback(() => {
    const newValue = Math.min(current + increment, max);
    onUpdateCurrent(newValue);
  }, [current, increment, max, onUpdateCurrent]);

  const handleDecrementClick = useCallback(() => {
    onDecrement(increment);
  }, [increment, onDecrement]);

  const parsedAmount = parseInt(amountInputValue, 10);
  const isAmountValid = !Number.isNaN(parsedAmount) && parsedAmount > 0;

  const handleApplyDamage = useCallback(() => {
    if (!isAmountValid) return;
    onDecrement(parsedAmount);
    setAmountInputValue('');
  }, [isAmountValid, onDecrement, parsedAmount]);

  const handleApplyHeal = useCallback(() => {
    if (!isAmountValid) return;
    onHeal(parsedAmount);
    setAmountInputValue('');
  }, [isAmountValid, onHeal, parsedAmount]);

  const isDecrementDisabled =
    disabled ||
    (type === 'PV'
      ? current <= pvMinimo && temp <= 0
      : current <= 0 && temp <= 0);

  const isIncrementDisabled = disabled || current >= max;

  const tooltipContent = (
    <Box>
      <Typography variant='caption'>
        Atual: {current}/{max}
      </Typography>
      {hasTemp && (
        <>
          <br />
          <Typography
            variant='caption'
            sx={{ color: tempColor, fontWeight: 'bold' }}
          >
            Temporario: +{temp}
          </Typography>
        </>
      )}
      <br />
      <Typography variant='caption'>Calculado: {calculatedMax}</Typography>
      {type === 'PV' && (
        <>
          <br />
          <Typography variant='caption'>Minimo: {pvMinimo}</Typography>
        </>
      )}
      {isUnconscious && (
        <>
          <br />
          <Typography
            variant='caption'
            sx={{ color: negativeColor, fontWeight: 'bold' }}
          >
            Desacordado
          </Typography>
        </>
      )}
      {isDead && (
        <>
          <br />
          <Typography
            variant='caption'
            sx={{ color: deadColor, fontWeight: 'bold' }}
          >
            Morto
          </Typography>
        </>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {/* Circular Progress + value (tap to open drawer) */}
      <Tooltip title={tooltipContent} arrow>
        <Box
          onClick={disabled || !onOpenDrawer ? undefined : onOpenDrawer}
          role={disabled || !onOpenDrawer ? undefined : 'button'}
          tabIndex={disabled || !onOpenDrawer ? undefined : 0}
          onKeyDown={(e) => {
            if (disabled || !onOpenDrawer) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenDrawer();
            }
          }}
          aria-label={onOpenDrawer ? `Editar ${type}` : undefined}
          sx={{
            position: 'relative',
            display: 'inline-flex',
            width: 100,
            height: 100,
            cursor: disabled || !onOpenDrawer ? 'default' : 'pointer',
            borderRadius: '50%',
            transition: 'transform 120ms ease, box-shadow 120ms ease',
            '&:hover':
              disabled || !onOpenDrawer
                ? undefined
                : {
                    transform: 'scale(1.03)',
                    boxShadow: `0 0 0 4px ${color}22`,
                  },
            '&:focus-visible': {
              outline: `2px solid ${color}`,
              outlineOffset: 4,
            },
          }}
        >
          <CircularProgress
            variant='determinate'
            value={100}
            size={100}
            thickness={4}
            sx={{
              position: 'absolute',
              color: theme.palette.grey[300],
            }}
          />
          <CircularProgress
            variant='determinate'
            value={percentage}
            size={100}
            thickness={4}
            sx={{
              color,
              position: 'absolute',
              ...(isNegative && {
                filter: 'drop-shadow(0 0 8px currentColor)',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                },
              }),
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            {isDead ? (
              <Typography sx={{ fontSize: '40px', lineHeight: 1 }}>
                💀
              </Typography>
            ) : (
              <>
                <Typography
                  variant='h4'
                  component='div'
                  sx={{
                    fontFamily: 'Tfont',
                    color,
                    fontWeight: 'bold',
                    ...(isNegative && {
                      textShadow: `0 0 10px ${color}`,
                    }),
                  }}
                >
                  {current}
                </Typography>
                {hasTemp && (
                  <Typography
                    variant='caption'
                    sx={{
                      fontSize: '10px',
                      color: tempColor,
                      fontWeight: 'bold',
                      lineHeight: 0.8,
                    }}
                  >
                    +{temp}
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Box>
      </Tooltip>

      {/* Label */}
      <Stack direction='row' spacing={0.5} alignItems='center'>
        <Typography
          sx={{
            fontFamily: 'Tfont',
            fontSize: '14px',
            fontWeight: 'bold',
            color: theme.palette.text.primary,
          }}
        >
          {type} {current}/{max}
        </Typography>
      </Stack>

      {/* Status chips */}
      {hasTemp && (
        <Chip
          size='small'
          label={`+${temp} temp`}
          color='warning'
          sx={{ height: 20, fontSize: '0.65rem' }}
        />
      )}
      {isUnconscious && (
        <Chip
          size='small'
          label='Desacordado'
          color='error'
          icon={<HotelIcon sx={{ fontSize: 14 }} />}
          sx={{
            height: 20,
            fontSize: '0.65rem',
            '& .MuiChip-icon': { marginLeft: '4px' },
          }}
        />
      )}
      {isDead && (
        <Chip
          size='small'
          label='Morto'
          sx={{
            height: 20,
            fontSize: '0.65rem',
            backgroundColor: deadColor,
            color: 'white',
          }}
        />
      )}

      {/* Quick step controls */}
      <Stack direction='row' spacing={0.5} alignItems='center' sx={{ mt: 0.5 }}>
        <IconButton
          size='small'
          onClick={handleDecrementClick}
          disabled={isDecrementDisabled}
          aria-label={`Reduzir ${type} em ${increment}`}
          sx={{
            backgroundColor: color,
            color: 'white',
            width: 32,
            height: 32,
            '&:hover': { backgroundColor: normalDarkColor },
            '&:disabled': {
              backgroundColor: theme.palette.grey[400],
              color: theme.palette.grey[600],
            },
          }}
        >
          <RemoveIcon fontSize='small' />
        </IconButton>
        <TextField
          size='small'
          value={incrementInputValue}
          onChange={handleIncrementChange}
          disabled={disabled}
          inputProps={{
            inputMode: 'numeric',
            style: {
              textAlign: 'center',
              padding: '4px 2px',
              fontSize: '12px',
              fontWeight: 600,
              width: 32,
            },
            'aria-label': 'Incremento',
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 32,
              '& fieldset': { borderColor: color },
            },
          }}
        />
        <IconButton
          size='small'
          onClick={handleIncrementClick}
          disabled={isIncrementDisabled}
          aria-label={`Aumentar ${type} em ${increment}`}
          sx={{
            backgroundColor: color,
            color: 'white',
            width: 32,
            height: 32,
            '&:hover': { backgroundColor: normalDarkColor },
            '&:disabled': {
              backgroundColor: theme.palette.grey[400],
              color: theme.palette.grey[600],
            },
          }}
        >
          <AddIcon fontSize='small' />
        </IconButton>
      </Stack>

      {/* Amount input + Dano/Curar */}
      <Stack direction='row' spacing={0.5} alignItems='center'>
        <TextField
          size='small'
          value={amountInputValue}
          onChange={handleAmountChange}
          disabled={disabled}
          placeholder='0'
          inputProps={{
            inputMode: 'numeric',
            style: {
              textAlign: 'center',
              padding: '6px 4px',
              fontSize: '13px',
              fontWeight: 600,
              width: 44,
            },
            'aria-label': `Valor de dano ou cura para ${type}`,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 32,
              '& fieldset': { borderColor: theme.palette.divider },
            },
          }}
        />
        <Button
          size='small'
          variant='contained'
          color='error'
          onClick={handleApplyDamage}
          disabled={disabled || !isAmountValid}
          sx={{
            minWidth: 0,
            height: 32,
            px: 1.2,
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          Dano
        </Button>
        <Button
          size='small'
          variant='contained'
          onClick={handleApplyHeal}
          disabled={disabled || !isAmountValid}
          sx={{
            minWidth: 0,
            height: 32,
            px: 1.2,
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'none',
            backgroundColor: color,
            '&:hover': { backgroundColor: normalDarkColor },
          }}
        >
          Curar
        </Button>
        {onOpenDrawer && (
          <Tooltip title='Editar PV/PM, temp e máximo'>
            <span>
              <IconButton
                size='small'
                onClick={onOpenDrawer}
                disabled={disabled}
                aria-label={`Abrir edição completa de ${type}`}
                sx={{ width: 32, height: 32 }}
              >
                <EditIcon fontSize='small' />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
};

export default StatControl;
