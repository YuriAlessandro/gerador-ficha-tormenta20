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
import { SkillRollResult } from 't20-sheet-builder/build/domain/entities/Skill/SheetSkill';
import { addSignForRoll } from './StringHelper';

interface Props extends CustomContentProps {
  rollResult: number;
  bonus: number;
  roll: SkillRollResult;
}

const DiceRollResult = forwardRef<HTMLDivElement, Props>(
  ({ id, roll, ...props }, ref) => {
    const theme = useTheme();
    const { closeSnackbar } = useSnackbar();

    let backgroundColor = '#313131';
    if (roll.isCritical) backgroundColor = theme.palette.success.main;
    if (roll.isFumble) backgroundColor = theme.palette.error.main;

    const totalBonus =
      roll.modifiersTotal +
      roll.attributeModifier +
      roll.trainingPoints +
      roll.levelPoints;

    return (
      <SnackbarContent ref={ref}>
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
            <Stack
              direction='column'
              spacing={1}
              sx={{
                alignItems: 'center',
              }}
            >
              <Stack
                direction='row'
                spacing={2}
                sx={{
                  alignItems: 'center',
                }}
              >
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
                    <Stack
                      sx={{
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 20,
                        }}
                      >
                        {roll.total}
                      </Typography>
                      {totalBonus !== 0 && (
                        <Stack
                          sx={{
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Stack direction='row'>
                            <Typography
                              sx={{
                                fontSize: 10,
                              }}
                            >
                              {roll.roll.total}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: 10,
                              }}
                            >
                              {addSignForRoll(totalBonus)}
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
                Rolagem de <strong>{props.message}</strong>
              </Typography>
            </Stack>
          </CardActions>
        </Card>
      </SnackbarContent>
    );
  }
);

export default DiceRollResult;
