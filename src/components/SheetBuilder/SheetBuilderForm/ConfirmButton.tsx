import React from 'react';
import { Button } from '@mui/material';

type Props = {
  confirm(): void;
};

const ConfirmButton = ({ confirm }: Props) => (
  <Button onClick={confirm} variant='contained' color='primary'>
    Atualizar
  </Button>
);

export default ConfirmButton;
