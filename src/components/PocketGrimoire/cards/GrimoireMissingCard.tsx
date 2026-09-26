import React from 'react';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';

interface Props {
  name: string;
  onRemove: () => void;
}

const GrimoireMissingCard: React.FC<Props> = ({ name, onRemove }) => (
  <Paper
    variant='outlined'
    sx={{
      mb: 1,
      p: 1.5,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      borderStyle: 'dashed',
    }}
  >
    <HelpOutlinedIcon fontSize='small' sx={{ color: 'text.secondary' }} />
    <Box sx={{ flex: 1 }}>
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        {name} não existe mais na enciclopédia.
      </Typography>
    </Box>
    <Tooltip title='Remover do grimório'>
      <IconButton
        aria-label={`Remover ${name} do grimório`}
        onClick={onRemove}
        size='small'
      >
        <DeleteOutlinedIcon fontSize='small' />
      </IconButton>
    </Tooltip>
  </Paper>
);

export default GrimoireMissingCard;
