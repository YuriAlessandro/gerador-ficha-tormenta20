import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface Props {
  term: string;
  explanation: string;
}

/** ⓘ com a explicação de um termo de regra (passar o mouse ou tocar). */
const TermInfo: React.FC<Props> = ({ term, explanation }) => (
  <Tooltip title={explanation} arrow enterTouchDelay={0} leaveTouchDelay={6000}>
    <IconButton
      size='small'
      aria-label={`O que significa "${term}"?`}
      sx={{ p: 0.25, ml: 0.25, color: 'text.secondary' }}
    >
      <InfoOutlinedIcon sx={{ fontSize: '0.95rem' }} />
    </IconButton>
  </Tooltip>
);

export default TermInfo;
