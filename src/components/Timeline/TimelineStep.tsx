import React from 'react';
import {
  TimelineConnector,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  TimelineContent,
  TimelineOppositeContent,
} from '@mui/lab';

const TimelineStep: React.FC<{
  children: React.ReactNode;
  icon: React.ReactNode;
  oppositeContent?: React.ReactNode;
}> = ({ icon, children, oppositeContent }) => (
  <TimelineItem>
    <TimelineOppositeContent sx={{ flexGrow: 0.15, m: 'auto 0' }}>
      {oppositeContent || ''}
    </TimelineOppositeContent>
    <TimelineSeparator>
      <TimelineConnector />
      <TimelineDot>{icon}</TimelineDot>
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent sx={{ py: '12px', px: 2 }}>{children}</TimelineContent>
  </TimelineItem>
);

export default TimelineStep;
