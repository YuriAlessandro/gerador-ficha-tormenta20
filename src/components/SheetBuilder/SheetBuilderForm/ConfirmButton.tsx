import React from 'react';
import { Button } from '@mui/material';

type Props = {
  confirm(): void;
  disabled?: boolean;
  label?: string;
};

const ConfirmButton = ({ confirm, disabled, label }: Props) => (
  <Button
    onClick={confirm}
    variant='contained'
    color='primary'
    disabled={disabled}
  >
    {label || 'Atualizar'}
  </Button>
);

export default ConfirmButton;
