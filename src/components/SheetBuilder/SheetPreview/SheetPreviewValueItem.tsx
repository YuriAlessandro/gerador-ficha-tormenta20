import React from 'react';
import { Box, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

type Props = {
  label: string;
  value: number;
};

const SheetPreviewItem = ({ label, value }: Props) => (
  <Stack direction='row' alignItems='center'>
    <Box sx={{ mr: 1, fontSize: '35px' }}>
      <AddIcon />
    </Box>
    <Stack
      alignItems='center'
      sx={{ textAlign: 'center' }}
      justifyContent='center'
      height='100px'
    >
      <Box>{value}</Box>
      <Box sx={{ borderTop: '1px solid black', fontSize: '10px' }}>{label}</Box>
    </Stack>
  </Stack>
);

export default SheetPreviewItem;
