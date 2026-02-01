import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import HotelIcon from '@mui/icons-material/Hotel';

const DEBOUNCE_DELAY = 500; // ms to wait before sending update

interface StatControlProps {
  type: 'PV' | 'PM';
  current: number;
  max: number;
  calculatedMax: number;
  increment: number;
  onUpdateCurrent: (newCurrent: number) => void;
  onUpdateIncrement: (newIncrement: number) => void;
  disabled?: boolean;
}

const StatControl: React.FC<StatControlProps> = ({
  type,
  current,
  max,
  calculatedMax,
  increment,
  onUpdateCurrent,
  onUpdateIncrement,
  disabled = false,
}) => {
  const theme = useTheme();
  const [isHovering, setIsHovering] = useState(false);

  // Debounced update state
  const [pendingValue, setPendingValue] = useState<number | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The displayed value is the pending value if set, otherwise the actual current
  const displayedCurrent = pendingValue !== null ? pendingValue : current;

  // Sync pending value when current changes externally
  useEffect(() => {
    if (pendingValue !== null && current === pendingValue) {
      setPendingValue(null);
    }
  }, [current, pendingValue]);

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    },
    []
  );

  // Debounced update function
  const debouncedUpdate = useCallback(
    (newValue: number) => {
      setPendingValue(newValue);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        onUpdateCurrent(newValue);
        debounceTimerRef.current = null;
      }, DEBOUNCE_DELAY);
    },
    [onUpdateCurrent]
  );

  // Detect over-max state (temporary bonuses) - use displayedCurrent for UI
  const isOverMax = displayedCurrent > max;
  const bonus = isOverMax ? displayedCurrent - max : 0;

  // Calculate PV minimum (only for PV, not PM)
  // Minimum is -10 or -2*max, whichever is lower (more negative)
  const pvMinimo = type === 'PV' ? Math.min(-10, -2 * max) : 0;

  // Character states - use displayedCurrent for UI
  const isNegative = type === 'PV' && displayedCurrent < 0;
  const isUnconscious =
    type === 'PV' && displayedCurrent <= 0 && displayedCurrent > pvMinimo;
  const isDead = type === 'PV' && displayedCurrent <= pvMinimo;

  // Calculate percentage for circular progress (cap at 100% when over-max, 0% when negative)
  const percentage =
    max > 0 ? Math.max(0, Math.min((displayedCurrent / max) * 100, 100)) : 0;

  // Determine color based on type and state
  const normalColor =
    type === 'PV' ? theme.palette.success.main : theme.palette.info.main;
  const normalDarkColor =
    type === 'PV' ? theme.palette.success.dark : theme.palette.info.dark;

  // Over-max colors (golden/warning)
  const overMaxColor = theme.palette.warning.main;
  const overMaxDarkColor = theme.palette.warning.dark;

  // Negative/dead colors
  const negativeColor = theme.palette.error.main;
  const negativeDarkColor = theme.palette.error.dark;
  const deadColor = theme.palette.grey[500];

  // Select color based on state
  const getColor = () => {
    if (isDead) return deadColor;
    if (isNegative) return negativeColor;
    if (isOverMax) return overMaxColor;
    return normalColor;
  };

  const getDarkColor = () => {
    if (isDead) return theme.palette.grey[700];
    if (isNegative) return negativeDarkColor;
    if (isOverMax) return overMaxDarkColor;
    return normalDarkColor;
  };

  const color = getColor();
  const darkColor = getDarkColor();

  const handleIncrement = useCallback(() => {
    // Use displayed value (which includes pending changes) for calculation
    const baseValue = displayedCurrent;
    // Se ainda não atingiu o máximo, cap no máximo (healing normal)
    if (baseValue < max) {
      const newValue = Math.min(baseValue + increment, max);
      debouncedUpdate(newValue);
    }
    // Se já está no máximo ou acima, adiciona como bônus temporário
    else {
      const newValue = baseValue + increment;
      debouncedUpdate(newValue);
    }
  }, [displayedCurrent, increment, max, debouncedUpdate]);

  const handleDecrement = useCallback(() => {
    // Use displayed value (which includes pending changes) for calculation
    const baseValue = displayedCurrent;
    if (type === 'PV') {
      // For PV, allow going down to minimum (negative)
      const newValue = Math.max(baseValue - increment, pvMinimo);
      debouncedUpdate(newValue);
    } else {
      // For PM, keep minimum at 0
      const newValue = Math.max(baseValue - increment, 0);
      debouncedUpdate(newValue);
    }
  }, [displayedCurrent, increment, pvMinimo, type, debouncedUpdate]);

  const handleIncrementChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(event.target.value, 10);
      if (!Number.isNaN(value) && value >= 1) {
        onUpdateIncrement(value);
      }
    },
    [onUpdateIncrement]
  );

  const tooltipContent = (
    <Box>
      <Typography variant='caption'>
        Atual: {displayedCurrent}/{max}
        {isOverMax && ` (+${bonus} temporário)`}
      </Typography>
      <br />
      <Typography variant='caption'>Calculado: {calculatedMax}</Typography>
      {type === 'PV' && (
        <>
          <br />
          <Typography variant='caption'>Mínimo: {pvMinimo}</Typography>
        </>
      )}
      {isOverMax && (
        <>
          <br />
          <Typography
            variant='caption'
            sx={{ color: overMaxColor, fontWeight: 'bold' }}
          >
            ⭐ Bônus temporário ativo
          </Typography>
        </>
      )}
      {isUnconscious && (
        <>
          <br />
          <Typography
            variant='caption'
            sx={{ color: negativeColor, fontWeight: 'bold' }}
          >
            💤 Desacordado
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
            💀 Morto
          </Typography>
        </>
      )}
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} arrow>
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Circular Progress Container */}
        <Box
          sx={{
            position: 'relative',
            display: 'inline-flex',
            width: 100,
            height: 100,
          }}
        >
          {/* Background circle */}
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
          {/* Progress circle */}
          <CircularProgress
            variant='determinate'
            value={percentage}
            size={100}
            thickness={4}
            sx={{
              color,
              position: 'absolute',
              ...((isOverMax || isNegative) && {
                filter: 'drop-shadow(0 0 8px currentColor)',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                },
              }),
            }}
          />
          {/* Current value in center */}
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
              // Skull icon when dead
              <Typography
                sx={{
                  fontSize: '40px',
                  lineHeight: 1,
                }}
              >
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
                    ...((isOverMax || isNegative) && {
                      textShadow: `0 0 10px ${color}`,
                    }),
                  }}
                >
                  {displayedCurrent}
                </Typography>
                {isOverMax && (
                  <Typography
                    variant='caption'
                    sx={{
                      fontSize: '10px',
                      color,
                      fontWeight: 'bold',
                      lineHeight: 0.8,
                    }}
                  >
                    +{bonus}
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* Label */}
        <Typography
          sx={{
            fontFamily: 'Tfont',
            fontSize: '14px',
            fontWeight: 'bold',
            color: theme.palette.text.primary,
          }}
        >
          {type}
        </Typography>

        {/* Unconscious indicator */}
        {isUnconscious && (
          <Chip
            size='small'
            label='Desacordado'
            color='error'
            icon={<HotelIcon sx={{ fontSize: 14 }} />}
            sx={{
              height: 20,
              fontSize: '0.65rem',
              '& .MuiChip-icon': {
                marginLeft: '4px',
              },
            }}
          />
        )}

        {/* Dead indicator */}
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

        {/* Hover Controls */}
        {isHovering && !disabled && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor:
                theme.palette.mode === 'dark' ? '#2c2c2c' : '#ffffff',
              borderRadius: 2,
              boxShadow: theme.shadows[16],
              border: `2px solid ${color}`,
              p: 1.5,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              minWidth: 160,
            }}
          >
            {/* +/- Buttons */}
            <Stack direction='row' spacing={1} alignItems='center'>
              <IconButton
                size='small'
                onClick={handleDecrement}
                disabled={
                  type === 'PV'
                    ? displayedCurrent <= pvMinimo
                    : displayedCurrent <= 0
                }
                sx={{
                  backgroundColor: color,
                  color: 'white',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: darkColor,
                    boxShadow: 4,
                  },
                  '&:disabled': {
                    backgroundColor: theme.palette.grey[400],
                    color: theme.palette.grey[600],
                  },
                }}
              >
                <RemoveIcon fontSize='small' />
              </IconButton>

              <Box
                sx={{
                  minWidth: 60,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: 'bold',
                    color:
                      isDead || isNegative || isOverMax
                        ? color
                        : theme.palette.text.primary,
                    fontSize: '0.95rem',
                    lineHeight: 1.2,
                  }}
                >
                  {isDead ? '💀' : `${displayedCurrent}/${max}`}
                </Typography>
                {isOverMax && (
                  <Typography
                    variant='caption'
                    sx={{
                      fontSize: '0.7rem',
                      color: overMaxColor,
                      fontWeight: 600,
                      lineHeight: 1,
                    }}
                  >
                    (+{bonus})
                  </Typography>
                )}
                {isUnconscious && (
                  <Typography
                    variant='caption'
                    sx={{
                      fontSize: '0.6rem',
                      color: negativeColor,
                      fontWeight: 600,
                      lineHeight: 1,
                    }}
                  >
                    Desacordado
                  </Typography>
                )}
              </Box>

              <IconButton
                size='small'
                onClick={handleIncrement}
                disabled={false}
                sx={{
                  backgroundColor: color,
                  color: 'white',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: darkColor,
                    boxShadow: 4,
                  },
                }}
              >
                <AddIcon fontSize='small' />
              </IconButton>
            </Stack>

            {/* Increment Control */}
            <Stack direction='row' spacing={0.5} alignItems='center'>
              <Typography
                variant='caption'
                sx={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Incremento:
              </Typography>
              <TextField
                size='small'
                type='number'
                value={increment}
                onChange={handleIncrementChange}
                inputProps={{
                  min: 1,
                  style: {
                    textAlign: 'center',
                    padding: '2px 4px',
                    fontSize: '12px',
                    fontWeight: 600,
                  },
                }}
                sx={{
                  width: 50,
                  '& .MuiOutlinedInput-root': {
                    height: 24,
                    backgroundColor:
                      theme.palette.mode === 'dark' ? '#404040' : '#f5f5f5',
                    '& fieldset': {
                      borderColor: color,
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: darkColor,
                      borderWidth: '2px',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: color,
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                  },
                }}
              />
            </Stack>
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default StatControl;
