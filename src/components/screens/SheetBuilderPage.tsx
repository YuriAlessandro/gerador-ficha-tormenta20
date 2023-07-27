import { Box, Fab, useTheme } from '@mui/material';
import React, { useState } from 'react';
import styled from '@emotion/styled';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SheetBuilderForm from '../SheetBuilder/SheetBuilderForm/SheetBuilderForm';
import SheetPreview from '../SheetBuilder/SheetPreview/SheetPreview';

const SheetBuilderPage: React.FC = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();

  const handleChange = (newValue: number) => {
    setValue(newValue);
  };

  const Title = styled.h1`
    font-family: 'Tfont';
    color: ${theme.palette.primary.main};
  `;

  const FabDiv = styled.div`
    margin: 0px;
    top: auto;
    right: 20px;
    bottom: 20px;
    left: auto;
    position: fixed;
    z-index: 10;
  `;

  return (
    <div style={{ maxWidth: '1920px', margin: '0 auto' }}>
      <FabDiv>
        {value === 0 && (
          <Fab color='primary' variant='extended' onClick={() => setValue(1)}>
            <EditIcon sx={{ mr: 1 }} />
            Editar Ficha
          </Fab>
        )}
        {value === 1 && (
          <Fab color='primary' variant='extended' onClick={() => setValue(0)}>
            <VisibilityIcon sx={{ mr: 1 }} />
            Visualizar Ficha
          </Fab>
        )}
      </FabDiv>
      <Box sx={{ p: 5 }}>
        <Title>Gerenciar Ficha</Title>
      </Box>
      <Box sx={{ display: value === 0 ? 'block' : 'none' }}>
        <SheetPreview handleChange={handleChange} />
      </Box>
      <Box sx={{ display: value === 1 ? 'block' : 'none' }}>
        <SheetBuilderForm />
      </Box>
    </div>
  );
};
export default SheetBuilderPage;
