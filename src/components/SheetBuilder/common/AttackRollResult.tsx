import React, { forwardRef } from 'react';
import { useSnackbar, CustomContentProps, SnackbarContent } from 'notistack';
import {
  Box,
  Card,
  CardActions,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import diceIcon from '@/assets/images/dice.svg';
import { addSignForRoll } from './StringHelper';

interface Props extends CustomContentProps {
  rollResult: number;
  bonus: number;
  damage: number;
  damageBonus: number;
  dice: number;
  diceQtd: number;
  criticalThreat: number;
}

const AttackRollResult = forwardRef<HTMLDivElement, Props>(
  (
    {
      id,
      rollResult,
      bonus,
      damage,
      damageBonus,
      diceQtd,
      dice,
      criticalThreat,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const { closeSnackbar } = useSnackbar();

    const total = rollResult + bonus;
    const totalDamage = damage + damageBonus;

    let backgroundColor = '#313131';
    if (rollResult >= criticalThreat)
      backgroundColor = theme.palette.success.main;
    if (rollResult === 1) backgroundColor = theme.palette.error.main;

    return (
      <SnackbarContent ref={ref} style={{ display: 'flex' }}>
        <Card
          sx={{
            color: '#FFFFFF',
            backgroundColor,
            minWidth: '250px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <CardActions>
            <Stack direction='column' alignItems='center' spacing={1}>
              <Stack direction='row' alignItems='center' spacing={2}>
                <Box
                  sx={{
                    backgroundImage: `url(${diceIcon})`,
                    width: '50px',
                    height: '50px',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                <Typography variant='body2'>=</Typography>
                <Stack direction='row' spacing={1}>
                  <Box
                    sx={{
                      border: '1px solid white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 2,
                      borderRadius: '20% 40% 20% 40%',
                    }}
                  >
                    <Stack alignItems='center'>
                      <Typography fontSize={10}>Ataque</Typography>
                      <Typography fontSize={20}>{total}</Typography>
                      {bonus !== 0 && (
                        <Stack justifyContent='center' alignItems='center'>
                          <Stack direction='row'>
                            <Typography fontSize={10}>{rollResult}</Typography>
                            <Typography fontSize={10}>
                              {addSignForRoll(bonus as number)}
                            </Typography>
                          </Stack>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                  <Box sx={{ borderRight: '1px solid #FFFFFF' }} />
                  <Box
                    sx={{
                      border: '1px solid white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 2,
                      borderRadius: '20% 40% 20% 40%',
                    }}
                  >
                    <Stack alignItems='center'>
                      <Typography fontSize={10}>
                        Dano ({diceQtd}d{dice})
                      </Typography>
                      <Typography fontSize={20}>{totalDamage}</Typography>
                      {bonus !== 0 && (
                        <Stack justifyContent='center' alignItems='center'>
                          <Stack direction='row'>
                            <Typography fontSize={10}>{damage}</Typography>
                            <Typography fontSize={10}>
                              {addSignForRoll(damageBonus as number)}
                            </Typography>
                          </Stack>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                </Stack>
                <Box>
                  <IconButton size='small' onClick={() => closeSnackbar(id)}>
                    <CloseIcon fontSize='small' sx={{ color: 'white' }} />
                  </IconButton>
                </Box>
              </Stack>
              <Typography variant='body2'>
                Ataque com <strong>{props.message}</strong>
              </Typography>
            </Stack>
          </CardActions>
        </Card>
      </SnackbarContent>
    );
  }
);

export default AttackRollResult;
