import { Button } from '@mui/material';
import React, { PropsWithChildren } from 'react';

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

const AttributeInputButton = ({
  onClick,
  children,
  disabled,
}: PropsWithChildren<Props>) => (
  <Button
    sx={{ maxHeight: '30px' }}
    size='small'
    variant='outlined'
    onClick={onClick}
    fullWidth
    disabled={disabled}
  >
    {children}
  </Button>
);

export default AttributeInputButton;
