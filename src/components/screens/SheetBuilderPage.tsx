import {
  AppBar,
  Box,
  Button,
  Card,
  Container,
  Tab,
  Tabs,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import styled from '@emotion/styled';
import SheetBuilderForm from '../SheetBuilder/SheetBuilderForm/SheetBuilderForm';
import SheetPreview from '../SheetBuilder/SheetPreview/SheetPreview';

const SheetBuilderPage: React.FC = () => {
  const [value, setValue] = useState(1);
  const theme = useTheme();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const Title = styled.h1`
    font-family: 'Tfont';
    color: ${theme.palette.primary.main};
  `;

  return (
    <div>
      <Box sx={{ p: 5 }}>
        <Title>Criar nova ficha</Title>
        <AppBar position='static' sx={{ alignContent: 'center' }}>
          <Tabs value={value} onChange={handleChange} variant='fullWidth'>
            <Tab label='Ficha' id='tab1' />
            <Tab label='Editar' id='tab2' />
          </Tabs>
        </AppBar>
      </Box>
      {value === 0 && <SheetPreview />}
      {value === 1 && (
        <div>
          <SheetBuilderForm />
          <Container>
            <Card
              sx={{
                width: '50%',
                display: 'flex',
                justifyContent: 'center',
                p: 3,
                mb: 2,
              }}
            >
              <Button
                variant='contained'
                color='primary'
                onClick={() => setValue(0)}
              >
                Visualizar Ficha
              </Button>
            </Card>
          </Container>
        </div>
      )}
    </div>
  );
};
export default SheetBuilderPage;
