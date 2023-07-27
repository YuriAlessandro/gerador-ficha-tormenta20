import React from 'react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  closeSnackbar: (id: number) => void;
  snackbarId: number;
}

const DiceRollerActions: React.FC<Props> = ({ closeSnackbar, snackbarId }) => (
  <IconButton onClick={() => closeSnackbar(snackbarId)}>
    <CloseIcon sx={{ color: 'white' }} />
  </IconButton>
);

export default DiceRollerActions;
