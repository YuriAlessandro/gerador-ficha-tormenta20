import { Button } from '@mui/material';
import React, { PropsWithChildren } from 'react';

type Props = {
  onClick: () => void;
};

const AttributeInputButton = ({
  onClick,
  children,
}: PropsWithChildren<Props>) => (
  <Button size='small' variant='outlined' onClick={onClick}>
    {children}
  </Button>
);

export default AttributeInputButton;
