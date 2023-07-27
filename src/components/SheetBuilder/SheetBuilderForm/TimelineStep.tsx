import React from 'react';
import {
  TimelineConnector,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  TimelineContent,
  TimelineOppositeContent,
} from '@mui/lab';
import { Box, Card, IconButton, useTheme } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import BookTitle from '../common/BookTitle';

const TimelineStep: React.FC<{
  id: number;
  children: React.ReactNode;
  icon: React.ReactNode;
  oppositeContent?: React.ReactNode;
  label: string;
  onChangeStep: (idx: number) => void;
  showingTab: number;
}> = ({
  id,
  icon,
  children,
  oppositeContent,
  label,
  onChangeStep,
  showingTab,
}) => {
  const theme = useTheme();

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
        <Card sx={{ p: 2 }}>
          {id !== 1 && id === showingTab && (
            <Box sx={{ textAlign: 'center', pb: 1 }}>
              <IconButton title='Voltar' onClick={() => onChangeStep(id - 2)}>
                <KeyboardArrowUpIcon />
              </IconButton>
            </Box>
          )}
          <BookTitle>{label}</BookTitle>
          {children}
          {id !== 6 && id === showingTab && (
            <Box sx={{ textAlign: 'center', pb: 1 }}>
              <IconButton title='Continuar' onClick={() => onChangeStep(id)}>
                <KeyboardArrowDownIcon />
              </IconButton>
            </Box>
          )}
        </Card>
      </TimelineContent>
    </TimelineItem>
  );
};

export default TimelineStep;
