import bgImage from '@/assets/images/fantasybg.png';
import styled from '@emotion/styled';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Breadcrumbs,
  Fab,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import {
  setActiveSheet,
  storeSheet,
  selectStoredSheet,
} from '../../store/slices/sheetStorage/sheetStorage';
import SheetBuilderForm from '../SheetBuilder/SheetBuilderForm/SheetBuilderForm';
import SheetPreview from '../SheetBuilder/SheetPreview/SheetPreview';
import SheetsService from '../../services/sheets.service';
import { RootState } from '../../store';

const SheetBuilderPage: React.FC = () => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();

  // Check if sheet exists in local storage
  const localSheet = useSelector((state: RootState) =>
    selectStoredSheet(id)(state)
  );

  useEffect(() => {
    const loadSheet = async () => {
      setLoading(true);

      // If sheet doesn't exist in local storage, try to load from cloud
      if (!localSheet) {
        try {
          const cloudSheet = await SheetsService.getSheetById(id);

          // Convert cloud sheet to local format and store temporarily
          // Spread all sheetData fields to ensure devotion, skills, proficiencies, etc are available
          dispatch(
            storeSheet({
              id: cloudSheet.id,
              date: new Date(cloudSheet.updatedAt).getTime(),
              name: cloudSheet.name,
              image: cloudSheet.image || '',
              form: {
                initialAttributes: {
                  method: 'dice' as const,
                },
              },
              sheet: cloudSheet.sheetData,
              // Spread SerializedCharacter fields from sheetData
              ...cloudSheet.sheetData,
            })
          );
        } catch (error) {
          console.error('Failed to load sheet from cloud:', error);
        }
      }

      dispatch(setActiveSheet(id));
      if (window.location.href.includes('new')) setValue(1);
      setLoading(false);
    };

    loadSheet();
  }, [id, localSheet, dispatch]);

  const isDarkTheme = theme.palette.mode === 'dark';

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

  const BackgroundBox = styled(Box)`
    background: linear-gradient(
        to top,
        rgba(255, 255, 255, 0) 20%,
        ${isDarkTheme ? '#212121' : '#f3f2f1'}
      ),
      url(${bgImage});
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  `;

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='50vh'
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
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

      <Breadcrumbs aria-label='breadcrumb' sx={{ p: 2 }}>
        <Link to='/sheets' color='inherit' href='/sheets'>
          Histórico Local
        </Link>
        <Typography color='text.primary'>Gerenciar Personagem</Typography>
      </Breadcrumbs>

      <BackgroundBox sx={{ display: value === 0 ? 'block' : 'none' }}>
        <Box sx={{ p: 5 }}>
          <Title>Visualizar Ficha</Title>
        </Box>
        <SheetPreview handleChange={handleChange} />
      </BackgroundBox>
      <Box sx={{ display: value === 1 ? 'block' : 'none' }}>
        <Box sx={{ p: 5 }}>
          <Title>Editar Ficha</Title>
        </Box>
        <SheetBuilderForm
          onFinishBuild={() => {
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
            setValue(0);
          }}
        />
      </Box>
    </>
  );
};
export default SheetBuilderPage;
