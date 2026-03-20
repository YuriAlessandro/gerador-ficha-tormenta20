import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
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
import ClearIcon from '@mui/icons-material/Clear';

interface StatControlProps {
  type: 'PV' | 'PM';
  current: number;
  max: number;
  calculatedMax: number;
  increment: number;
  temp: number;
  onUpdateCurrent: (newCurrent: number) => void;
  onUpdateIncrement: (newIncrement: number) => void;
  onUpdateTemp: (newTemp: number) => void;
  onDecrement: (amount: number) => void;
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
  onUpdateTemp,
  onDecrement,
  disabled = false,
}) => {
  const theme = useTheme();
  const [isHovering, setIsHovering] = useState(false);

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
  const negativeDarkColor = theme.palette.error.dark;
  const deadColor = theme.palette.grey[500];

  const getColor = () => {
    if (isDead) return deadColor;
    if (isNegative) return negativeColor;
    return normalColor;
  };

  const getDarkColor = () => {
    if (isDead) return theme.palette.grey[700];
    if (isNegative) return negativeDarkColor;
    return normalDarkColor;
  };

  const color = getColor();
  const darkColor = getDarkColor();

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(current + increment, max);
    onUpdateCurrent(newValue);
  }, [current, increment, max, onUpdateCurrent]);

  const handleDecrement = useCallback(() => {
    onDecrement(increment);
  }, [increment, onDecrement]);

  // Estado local para o input de incremento
  const [incrementInputValue, setIncrementInputValue] = useState(
    String(increment)
  );

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

  // Estado local para o input de temp
  const [tempInputValue, setTempInputValue] = useState(String(temp));

  useEffect(() => {
    setTempInputValue(String(temp));
  }, [temp]);

  const handleTempChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;
      if (inputValue !== '' && !/^\d*$/.test(inputValue)) {
        return;
      }
      setTempInputValue(inputValue);
      const numValue = parseInt(inputValue, 10);
      if (!Number.isNaN(numValue) && numValue >= 0) {
        onUpdateTemp(numValue);
      }
    },
    [onUpdateTemp]
  );

  const handleClearTemp = useCallback(() => {
    onUpdateTemp(0);
  }, [onUpdateTemp]);

  const isDecrementDisabled =
    type === 'PV'
      ? current <= pvMinimo && temp <= 0
      : current <= 0 && temp <= 0;

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

        {/* Temp indicator chip */}
        {hasTemp && (
          <Chip
            size='small'
            label={`+${temp} temp`}
            color='warning'
            sx={{
              height: 20,
              fontSize: '0.65rem',
            }}
          />
        )}

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
                disabled={isDecrementDisabled}
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
                      isDead || isNegative ? color : theme.palette.text.primary,
                    fontSize: '0.95rem',
                    lineHeight: 1.2,
                  }}
                >
                  {isDead ? '💀' : `${current}/${max}`}
                </Typography>
                {hasTemp && (
                  <Typography
                    variant='caption'
                    sx={{
                      fontSize: '0.7rem',
                      color: tempColor,
                      fontWeight: 600,
                      lineHeight: 1,
                    }}
                  >
                    (+{temp} temp)
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
                disabled={current >= max}
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
                value={incrementInputValue}
                onChange={handleIncrementChange}
                inputProps={{
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

            {/* Temp Control */}
            <Stack direction='row' spacing={0.5} alignItems='center'>
              <Typography
                variant='caption'
                sx={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: tempColor,
                }}
              >
                Temp:
              </Typography>
              <TextField
                size='small'
                value={tempInputValue}
                onChange={handleTempChange}
                inputProps={{
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
                      borderColor: tempColor,
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.warning.dark,
                      borderWidth: '2px',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: tempColor,
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                  },
                }}
              />
              {hasTemp && (
                <Button
                  size='small'
                  variant='outlined'
                  color='warning'
                  onClick={handleClearTemp}
                  startIcon={<ClearIcon sx={{ fontSize: 12 }} />}
                  sx={{
                    minWidth: 0,
                    height: 24,
                    fontSize: '0.6rem',
                    padding: '2px 6px',
                    '& .MuiButton-startIcon': {
                      marginRight: '2px',
                      marginLeft: 0,
                    },
                  }}
                >
                  Limpar
                </Button>
              )}
            </Stack>
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default StatControl;
