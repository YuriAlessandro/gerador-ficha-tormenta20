import React from 'react';
import {
  TimelineConnector,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  TimelineContent,
  TimelineOppositeContent,
} from '@mui/lab';
import { Box, Card, Chip, IconButton, useTheme } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  SheetBuilderStepConfirmedState,
  selectStepConfirmed,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import { useSelector } from 'react-redux';
import BookTitle from '../common/BookTitle';

const TimelineStep: React.FC<{
  id: number;
  children: React.ReactNode;
  icon: React.ReactNode;
  oppositeContent?: React.ReactNode;
  label: string;
  onChangeStep: (idx: number) => void;
  showingTab: number;
  stepConfirmedKey: keyof SheetBuilderStepConfirmedState;
}> = ({
  id,
  icon,
  children,
  oppositeContent,
  label,
  onChangeStep,
  showingTab,
  stepConfirmedKey,
}) => {
  const theme = useTheme();

  const stepStatus = useSelector(selectStepConfirmed(stepConfirmedKey));

  const generateStatusBadge = () => {
    switch (stepStatus) {
      case 'idle':
        return 'Novo';
      case 'confirmed':
        return 'Salvo';
      case 'pending':
        return 'Não salvo';
      default:
        return '';
    }
  };

  return (
    <TimelineItem>
      <TimelineOppositeContent sx={{ flexGrow: 0.15, m: 'auto 0' }}>
        {oppositeContent || ''}
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineConnector />
        <TimelineDot
          onClick={() => onChangeStep(id - 1)}
          sx={{
            cursor: 'pointer',
            backgroundColor: theme.palette.primary.light,
          }}
        >
          {icon}
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent sx={{ py: '12px', px: 2 }}>
        <>
          {stepStatus !== 'idle' && (
            <Chip
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#FFFFFF',
                width: '100px',
                mb: -1,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }}
              color={stepStatus === 'confirmed' ? 'success' : 'error'}
              label={generateStatusBadge()}
            />
          )}

          <Card
            sx={{
              p: 2,
              border:
                stepStatus === 'idle'
                  ? ''
                  : `1px solid ${
                      stepStatus === 'confirmed'
                        ? theme.palette.success.main
                        : theme.palette.error.main
                    }`,
            }}
          >
            {id !== 1 && id === showingTab && (
              <Box sx={{ textAlign: 'center', pb: 1 }}>
                <IconButton title='Voltar' onClick={() => onChangeStep(id - 2)}>
                  <KeyboardArrowUpIcon />
                </IconButton>
              </Box>
            )}
            <BookTitle>{label}</BookTitle>
            {children}
            {id !== 8 && id === showingTab && (
              <Box sx={{ textAlign: 'center', pb: 1 }}>
                <IconButton title='Continuar' onClick={() => onChangeStep(id)}>
                  <KeyboardArrowDownIcon />
                </IconButton>
              </Box>
            )}
          </Card>
        </>
      </TimelineContent>
    </TimelineItem>
  );
};

export default TimelineStep;
