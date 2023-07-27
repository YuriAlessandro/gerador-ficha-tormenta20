import { Button } from '@mui/material';
import React, { PropsWithChildren } from 'react';

type Props = {
  onClick: () => void;
};

const AttributeInputButton = ({
  onClick,
  children,
}: PropsWithChildren<Props>) => (
  <Button
    sx={{ maxHeight: '30px' }}
    size='small'
    variant='outlined'
    onClick={onClick}
    fullWidth
  >
    {children}
  </Button>
);

export default AttributeInputButton;
