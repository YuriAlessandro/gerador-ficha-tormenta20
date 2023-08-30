import React, { forwardRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Card,
  CardActions,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { CustomContentProps, SnackbarContent, useSnackbar } from 'notistack';

import diceIcon from '@/assets/images/dice.svg';
import { AttackResult, CharacterAttack } from 't20-sheet-builder';
import { addSignForRoll } from './StringHelper';

interface Props extends CustomContentProps {
  attackResult: AttackResult;
  attack: CharacterAttack;
}

const AttackRollResult = forwardRef<HTMLDivElement, Props>(
  ({ id, attackResult, attack, ...props }, ref) => {
    const theme = useTheme();
    const { closeSnackbar } = useSnackbar();
    const { damage, isCritical, test, isFumble } = attackResult;

    let backgroundColor = '#313131';
    if (isCritical) backgroundColor = theme.palette.success.main;
    if (isFumble) backgroundColor = theme.palette.error.main;

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
                      <Typography fontSize={20}>{test.total}</Typography>
                      {test.modifiersTotal !== 0 && (
                        <Stack justifyContent='center' alignItems='center'>
                          <Stack direction='row'>
                            <Typography fontSize={10}>
                              {test.rollResult.total}
                            </Typography>
                            <Typography fontSize={10}>
                              {addSignForRoll(test.modifiersTotal)}
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
                        Dano ({attack.attack.damage.diceQuantity}d
                        {attack.attack.damage.diceSides})
                      </Typography>
                      <Typography fontSize={20}>{damage.total}</Typography>
                      {damage.modifiersTotal !== 0 && (
                        <Stack justifyContent='center' alignItems='center'>
                          <Stack direction='row'>
                            <Typography fontSize={10}>
                              {damage.rollResult.total}
                            </Typography>
                            <Typography fontSize={10}>
                              {addSignForRoll(damage.modifiersTotal as number)}
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
