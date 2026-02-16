import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  LinearProgress,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import PeopleIcon from '@mui/icons-material/People';
import { getSupporterCount } from '../../services/subscription.service';

interface SupportGoal {
  id: number;
  target: number;
  label: string;
  description: string;
}

const GOALS: SupportGoal[] = [
  {
    id: 1,
    target: 25,
    label: 'Meta 1',
    description: '1 nova feature a cada trimestre',
  },
  {
    id: 2,
    target: 50,
    label: 'Meta 2',
    description: '1 nova feature a cada bimestre',
  },
  {
    id: 3,
    target: 100,
    label: 'Meta 3',
    description: '1 nova feature a cada mês',
  },
  {
    id: 4,
    target: 200,
    label: 'Meta 4',
    description: '2 novas features por mês',
  },
  {
    id: 5,
    target: 300,
    label: 'Meta 5',
    description: '3 novas features por mês',
  },
];

type GoalState = 'completed' | 'active' | 'upcoming';

function getGoalState(
  goal: SupportGoal,
  count: number,
  goals: SupportGoal[]
): GoalState {
  if (count >= goal.target) return 'completed';
  const firstIncomplete = goals.find((g) => count < g.target);
  if (firstIncomplete && firstIncomplete.id === goal.id) return 'active';
  return 'upcoming';
}

function getGoalProgress(
  goal: SupportGoal,
  count: number,
  goalIndex: number
): number {
  if (count >= goal.target) return 100;
  const previousTarget = goalIndex > 0 ? GOALS[goalIndex - 1].target : 0;
  if (count <= previousTarget) return 0;
  const range = goal.target - previousTarget;
  const progress = count - previousTarget;
  return Math.round((progress / range) * 100);
}

const SupportGoals: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadCount = async () => {
      try {
        setLoading(true);
        const result = await getSupporterCount();
        setCount(result);
      } catch {
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    loadCount();
  }, []);

  if (hasError && !loading) return null;

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        p: isMobile ? 2 : 3,
      }}
    >
      <Typography
        variant='h5'
        fontWeight='bold'
        sx={{ fontFamily: 'Tfont', mb: 2 }}
      >
        Metas de Apoio
      </Typography>

      {/* Current supporter count */}
      {loading ? (
        <Skeleton variant='rounded' height={40} sx={{ mb: 3 }} />
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 3,
            p: 1.5,
            borderRadius: 1,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <PeopleIcon />
          <Typography variant='body1' fontWeight='bold'>
            {count} {count === 1 ? 'apoiador ativo' : 'apoiadores ativos'}
          </Typography>
        </Box>
      )}

      {/* Goals list */}
      <Stack spacing={2.5}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Box key={`skeleton-${GOALS[i].id}`}>
                <Skeleton variant='text' width='60%' />
                <Skeleton
                  variant='rounded'
                  height={8}
                  sx={{ mt: 1, borderRadius: 1 }}
                />
              </Box>
            ))
          : GOALS.map((goal, index) => {
              const state = getGoalState(goal, count ?? 0, GOALS);
              const progress = getGoalProgress(goal, count ?? 0, index);

              return (
                <Box
                  key={goal.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: (() => {
                      if (state === 'completed')
                        return `${theme.palette.success.main}0A`;
                      if (state === 'active')
                        return `${theme.palette.primary.main}0A`;
                      return 'transparent';
                    })(),
                    opacity: state === 'upcoming' ? 0.6 : 1,
                  }}
                >
                  {/* Goal header */}
                  <Stack
                    direction='row'
                    alignItems='center'
                    justifyContent='space-between'
                    sx={{ mb: 0.5 }}
                  >
                    <Stack direction='row' alignItems='center' spacing={1}>
                      {state === 'completed' && (
                        <CheckCircleIcon
                          sx={{ color: 'success.main', fontSize: 20 }}
                        />
                      )}
                      {state === 'active' && (
                        <FlagIcon
                          sx={{ color: 'primary.main', fontSize: 20 }}
                        />
                      )}
                      <Typography
                        variant={isMobile ? 'body2' : 'body1'}
                        fontWeight={state !== 'upcoming' ? 'bold' : 'normal'}
                        color={
                          state === 'upcoming'
                            ? 'text.secondary'
                            : 'text.primary'
                        }
                      >
                        {goal.label} — {goal.target} apoiadores
                      </Typography>
                    </Stack>

                    {state === 'completed' && (
                      <Chip
                        label='Conquistada!'
                        size='small'
                        color='success'
                        sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                      />
                    )}
                    {state === 'active' && (
                      <Typography
                        variant='caption'
                        color='primary'
                        fontWeight='bold'
                      >
                        {count}/{goal.target}
                      </Typography>
                    )}
                  </Stack>

                  {/* Goal description */}
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color='text.secondary'
                    sx={{ mb: 1, ml: state !== 'upcoming' ? 3.5 : 0 }}
                  >
                    {goal.description}
                  </Typography>

                  {/* Progress bar */}
                  <LinearProgress
                    variant='determinate'
                    value={progress}
                    color={state === 'completed' ? 'success' : 'primary'}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor:
                        state === 'upcoming'
                          ? 'action.disabledBackground'
                          : undefined,
                    }}
                  />
                </Box>
              );
            })}
      </Stack>
    </Box>
  );
};

export default SupportGoals;
