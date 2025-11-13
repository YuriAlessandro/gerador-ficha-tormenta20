import React, { forwardRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Card,
  CardActions,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { CustomContentProps, SnackbarContent, useSnackbar } from 'notistack';
import diceIcon from '../../../assets/images/dice.svg';
import { checkD20Result } from '../../../functions/diceRoller';

export interface AttackRollData {
  weaponName: string;
  attackRoll: number;
  attackBonus: number;
  attackTotal: number;
  damageRolls: number[];
  damageModifier: number;
  damageTotal: number;
  diceString: string;
}

interface Props extends CustomContentProps {
  roll: AttackRollData;
}

const AttackRollNotification = forwardRef<HTMLDivElement, Props>(
  ({ id, roll }, ref) => {
    const theme = useTheme();
    const { closeSnackbar } = useSnackbar();

    const resultType = checkD20Result(roll.attackRoll);
    let backgroundColor = '#313131';
    if (resultType === 'critical') backgroundColor = theme.palette.success.main;
    if (resultType === 'fumble') backgroundColor = theme.palette.error.main;

    const damageRollsSum = roll.damageRolls.reduce(
      (sum, diceRoll) => sum + diceRoll,
      0
    );

    return (
      <SnackbarContent ref={ref}>
        <Card
          sx={{
            color: '#FFFFFF',
            backgroundColor,
            minWidth: '280px',
            maxWidth: '400px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <CardActions>
            <Stack direction='column' alignItems='center' spacing={1} py={1}>
              {/* Cabeçalho com dado */}
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
                <Typography variant='h6' fontWeight='bold'>
                  {roll.weaponName}
                </Typography>
                <IconButton size='small' onClick={() => closeSnackbar(id)}>
                  <CloseIcon fontSize='small' sx={{ color: 'white' }} />
                </IconButton>
              </Stack>

              <Divider sx={{ width: '100%', bgcolor: 'white', opacity: 0.5 }} />

              {/* Ataque */}
              <Stack direction='column' alignItems='center' spacing={0.5}>
                <Typography variant='caption' textTransform='uppercase'>
                  Ataque
                </Typography>
                <Box
                  sx={{
                    border: '1px solid white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 1.5,
                    borderRadius: '20% 40% 20% 40%',
                    minWidth: '50px',
                  }}
                >
                  <Stack alignItems='center'>
                    <Typography fontSize={20} fontWeight='bold'>
                      {roll.attackTotal}
                    </Typography>
                    {roll.attackBonus !== 0 && (
                      <Typography fontSize={9}>
                        d20({roll.attackRoll}){' '}
                        {roll.attackBonus >= 0 ? '+' : ''}
                        {roll.attackBonus}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>

              {/* Dano */}
              <Stack direction='column' alignItems='center' spacing={0.5}>
                <Typography variant='caption' textTransform='uppercase'>
                  Dano
                </Typography>
                <Box
                  sx={{
                    border: '1px solid white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 1.5,
                    borderRadius: '40% 20% 40% 20%',
                    minWidth: '50px',
                  }}
                >
                  <Stack alignItems='center'>
                    <Typography fontSize={20} fontWeight='bold'>
                      {roll.damageTotal}
                    </Typography>
                    <Typography fontSize={9}>
                      {roll.diceString}(
                      {roll.damageRolls.length === 1
                        ? roll.damageRolls[0]
                        : damageRollsSum}
                      )
                      {roll.damageModifier !== 0 &&
                        ` ${roll.damageModifier >= 0 ? '+' : ''}${
                          roll.damageModifier
                        }`}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Stack>
          </CardActions>
        </Card>
      </SnackbarContent>
    );
  }
);

AttackRollNotification.displayName = 'AttackRollNotification';

export default AttackRollNotification;
