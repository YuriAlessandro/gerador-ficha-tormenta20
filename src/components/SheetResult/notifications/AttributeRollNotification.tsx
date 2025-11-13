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

export interface AttributeRollData {
  attributeName: string;
  d20Roll: number;
  modifier: number;
  total: number;
}

interface Props extends CustomContentProps {
  roll: AttributeRollData;
}

const AttributeRollNotification = forwardRef<HTMLDivElement, Props>(
  ({ id, roll }, ref) => {
    const theme = useTheme();
    const { closeSnackbar } = useSnackbar();

    const resultType = checkD20Result(roll.d20Roll);
    let backgroundColor = '#313131';
    if (resultType === 'critical') backgroundColor = theme.palette.success.main;
    if (resultType === 'fumble') backgroundColor = theme.palette.error.main;

    return (
      <SnackbarContent ref={ref}>
        <Card
          sx={{
            color: '#FFFFFF',
            backgroundColor,
            minWidth: '250px',
            maxWidth: '350px',
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
                    {roll.modifier !== 0 && (
                      <Typography fontSize={10}>
                        d20({roll.d20Roll}) {roll.modifier >= 0 ? '+' : ''}
                        {roll.modifier}
                      </Typography>
                    )}
                  </Stack>
                </Box>
                <IconButton size='small' onClick={() => closeSnackbar(id)}>
                  <CloseIcon fontSize='small' sx={{ color: 'white' }} />
                </IconButton>
              </Stack>
              <Typography variant='body2' textAlign='center'>
                Teste de <strong>{roll.attributeName}</strong>
              </Typography>
            </Stack>
          </CardActions>
        </Card>
      </SnackbarContent>
    );
  }
);

AttributeRollNotification.displayName = 'AttributeRollNotification';

export default AttributeRollNotification;
