import { Button } from '@mui/material';
import React from 'react';

const SheetBuilderFinalTouches: React.FC<{ onFinishBuild: () => void }> = ({
  onFinishBuild,
}) => (
  <div>
    <h1>nome: NOME_DO_PERSONAGEM</h1>
    <Button variant='contained' onClick={onFinishBuild}>
      Ver ficha
    </Button>
  </div>
);

export default SheetBuilderFinalTouches;
