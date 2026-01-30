import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Casino as CasinoIcon, Edit as EditIcon } from '@mui/icons-material';
import ModeCard from './ModeCard';
import './characterCreation.css';

export type CreationMode = 'selection' | 'random' | 'manual';

interface CharacterCreationLayoutProps {
  mode: CreationMode;
  onModeChange: (mode: CreationMode) => void;
  randomFormContent: React.ReactNode;
  manualFormContent: React.ReactNode;
}

const CharacterCreationLayout: React.FC<CharacterCreationLayoutProps> = ({
  mode,
  onModeChange,
  randomFormContent,
  manualFormContent,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSelectRandom = () => {
    onModeChange('random');
  };

  const handleSelectManual = () => {
    onModeChange('manual');
  };

  const handleBackToSelection = () => {
    onModeChange('selection');
  };

  // Initial state: show both cards
  if (mode === 'selection') {
    return (
      <Box className='mode-cards-container'>
        <ModeCard
          icon={<EditIcon sx={{ fontSize: 'inherit' }} />}
          title='Nova Ficha'
          shortTitle='NOVA'
          description='Você escolhe cada opção passo a passo: raça, classe, atributos, poderes e magias.'
          isMinimized={false}
          position='left'
          onClick={handleSelectManual}
          variant='default'
        />
        <ModeCard
          icon={<CasinoIcon sx={{ fontSize: 'inherit' }} />}
          title='Ficha Aleatória'
          shortTitle='ALEAT.'
          description='O sistema escolhe raça, classe, atributos, e poderes aleatoriamente. Ideal para jogar rápido!'
          isMinimized={false}
          position='right'
          onClick={handleSelectRandom}
          variant='default'
        />
      </Box>
    );
  }

  // Random mode selected: form on left, minimized card on right
  if (mode === 'random') {
    return (
      <Box
        className={`mode-selected-layout random-selected ${
          isMobile ? '' : 'slide-in-left'
        }`}
      >
        <Box className='creation-form-container'>{randomFormContent}</Box>
        <ModeCard
          icon={<CasinoIcon sx={{ fontSize: 'inherit' }} />}
          title='Ficha Aleatória'
          shortTitle='ALEAT.'
          description=''
          isMinimized
          position='right'
          onClick={handleSelectRandom}
          onBack={handleBackToSelection}
          variant='primary'
        />
      </Box>
    );
  }

  // Manual mode selected: minimized card on left, form on right
  if (mode === 'manual') {
    return (
      <Box
        className={`mode-selected-layout manual-selected ${
          isMobile ? '' : 'slide-in-right'
        }`}
      >
        <ModeCard
          icon={<EditIcon sx={{ fontSize: 'inherit' }} />}
          title='Nova Ficha'
          shortTitle='NOVA'
          description=''
          isMinimized
          position='left'
          onClick={handleSelectManual}
          onBack={handleBackToSelection}
          variant='primary'
        />
        <Box className='creation-form-container'>{manualFormContent}</Box>
      </Box>
    );
  }

  return null;
};

export default CharacterCreationLayout;
