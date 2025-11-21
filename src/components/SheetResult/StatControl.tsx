import React, { useState, useCallback } from 'react';
import {
  Box,
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

  // Detect over-max state (temporary bonuses)
  const isOverMax = current > max;
  const bonus = isOverMax ? current - max : 0;

  // Calculate percentage for circular progress (cap at 100% when over-max)
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;

  // Determine color based on type and over-max state
  const normalColor =
    type === 'PV' ? theme.palette.success.main : theme.palette.info.main;
  const normalDarkColor =
    type === 'PV' ? theme.palette.success.dark : theme.palette.info.dark;

  // Over-max colors (golden/warning)
  const overMaxColor = theme.palette.warning.main;
  const overMaxDarkColor = theme.palette.warning.dark;

  const color = isOverMax ? overMaxColor : normalColor;
  const darkColor = isOverMax ? overMaxDarkColor : normalDarkColor;

  const handleIncrement = useCallback(() => {
    // Allow incrementing beyond max for temporary bonuses
    const newValue = current + increment;
    onUpdateCurrent(newValue);
  }, [current, increment, onUpdateCurrent]);

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(current - increment, 0);
    onUpdateCurrent(newValue);
  }, [current, increment, onUpdateCurrent]);

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
        Atual: {current}/{max}
        {isOverMax && ` (+${bonus} temporário)`}
      </Typography>
      <br />
      <Typography variant='caption'>Calculado: {calculatedMax}</Typography>
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
              ...(isOverMax && {
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
            <Typography
              variant='h4'
              component='div'
              sx={{
                fontFamily: 'Tfont',
                color,
                fontWeight: 'bold',
                ...(isOverMax && {
                  textShadow: `0 0 10px ${color}`,
                }),
              }}
            >
              {current}
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
                disabled={current <= 0}
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
                    color: isOverMax
                      ? overMaxColor
                      : theme.palette.text.primary,
                    fontSize: '0.95rem',
                    lineHeight: 1.2,
                  }}
                >
                  {current}/{max}
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
