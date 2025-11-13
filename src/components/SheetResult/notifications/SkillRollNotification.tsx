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
import diceIcon from '../../../assets/images/dice.svg';
import { checkD20Result } from '../../../functions/diceRoller';

export interface SkillRollData {
  skillName: string;
  d20Roll: number;
  halfLevel: number;
  attributeMod: number;
  training: number;
  others: number;
  total: number;
}

interface Props extends CustomContentProps {
  roll: SkillRollData;
}

const SkillRollNotification = forwardRef<HTMLDivElement, Props>(
  ({ id, roll }, ref) => {
    const theme = useTheme();
    const { closeSnackbar } = useSnackbar();

    const resultType = checkD20Result(roll.d20Roll);
    let backgroundColor = '#313131';
    if (resultType === 'critical') backgroundColor = theme.palette.success.main;
    if (resultType === 'fumble') backgroundColor = theme.palette.error.main;

    const totalBonus =
      roll.halfLevel + roll.attributeMod + roll.training + roll.others;

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
                <Box
                  sx={{
                    border: '1px solid white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 2,
                    borderRadius: '20% 40% 20% 40%',
                    minWidth: '60px',
                  }}
                >
                  <Stack alignItems='center'>
                    <Typography fontSize={24} fontWeight='bold'>
                      {roll.total}
                    </Typography>
                    {totalBonus !== 0 && (
                      <Typography fontSize={10}>
                        d20({roll.d20Roll}) {totalBonus >= 0 ? '+' : ''}
                        {totalBonus}
                      </Typography>
                    )}
                  </Stack>
                </Box>
                <IconButton size='small' onClick={() => closeSnackbar(id)}>
                  <CloseIcon fontSize='small' sx={{ color: 'white' }} />
                </IconButton>
              </Stack>
              <Typography variant='body2' textAlign='center'>
                <strong>{roll.skillName}</strong>
              </Typography>
              {totalBonus !== 0 && (
                <Stack direction='row' spacing={0.5} flexWrap='wrap'>
                  {roll.halfLevel !== 0 && (
                    <Typography variant='caption'>
                      ½nível({roll.halfLevel >= 0 ? '+' : ''}
                      {roll.halfLevel})
                    </Typography>
                  )}
                  {roll.attributeMod !== 0 && (
                    <Typography variant='caption'>
                      atrib({roll.attributeMod >= 0 ? '+' : ''}
                      {roll.attributeMod})
                    </Typography>
                  )}
                  {roll.training !== 0 && (
                    <Typography variant='caption'>
                      treino({roll.training >= 0 ? '+' : ''}
                      {roll.training})
                    </Typography>
                  )}
                  {roll.others !== 0 && (
                    <Typography variant='caption'>
                      outros({roll.others >= 0 ? '+' : ''}
                      {roll.others})
                    </Typography>
                  )}
                </Stack>
              )}
            </Stack>
          </CardActions>
        </Card>
      </SnackbarContent>
    );
  }
);

SkillRollNotification.displayName = 'SkillRollNotification';

export default SkillRollNotification;
