import React from 'react';
import { Box } from '@mui/material';
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
  const handleSelectRandom = () => onModeChange('random');
  const handleSelectManual = () => onModeChange('manual');
  const handleBackToSelection = () => onModeChange('selection');

  // Initial state: two clearly differentiated cards.
  if (mode === 'selection') {
    return (
      <Box className='mode-cards-container'>
        <ModeCard
          icon={<EditIcon sx={{ fontSize: 'inherit' }} />}
          title='Nova Ficha'
          shortTitle='Nova Ficha'
          description='Você escolhe cada opção passo a passo: raça, classe, atributos, poderes e magias.'
          speedLabel='Passo a passo'
          audienceLabel='Controle total'
          onClick={handleSelectManual}
          accent='edit'
        />
        <ModeCard
          icon={<CasinoIcon sx={{ fontSize: 'inherit' }} />}
          title='Ficha Aleatória'
          shortTitle='Ficha Aleatória'
          description='O sistema escolhe raça, classe, atributos e poderes aleatoriamente. Ideal para jogar rápido!'
          speedLabel='Instantâneo'
          audienceLabel='Ideal para começar'
          onClick={handleSelectRandom}
          accent='random'
        />
      </Box>
    );
  }

  // Selected state: each collapsed card keeps ITS OWN side (matching where it sat
  // in the selection screen) — Ficha Aleatória on the right, Nova Ficha on the
  // left — so the transition preserves spatial continuity.
  const isRandom = mode === 'random';

  const collapsedCard = (
    <ModeCard
      icon={
        isRandom ? (
          <CasinoIcon sx={{ fontSize: 'inherit' }} />
        ) : (
          <EditIcon sx={{ fontSize: 'inherit' }} />
        )
      }
      title={isRandom ? 'Ficha Aleatória' : 'Nova Ficha'}
      shortTitle={isRandom ? 'Ficha Aleatória' : 'Nova Ficha'}
      isMinimized
      onClick={isRandom ? handleSelectRandom : handleSelectManual}
      onBack={handleBackToSelection}
      accent={isRandom ? 'random' : 'edit'}
    />
  );

  const form = (
    <Box className='creation-form-container'>
      {isRandom ? randomFormContent : manualFormContent}
    </Box>
  );

  return (
    <Box
      key={mode}
      className={`mode-selected-layout ${
        isRandom
          ? 'random-selected slide-in-right'
          : 'manual-selected slide-in-left'
      }`}
    >
      {isRandom ? (
        <>
          {form}
          {collapsedCard}
        </>
      ) : (
        <>
          {collapsedCard}
          {form}
        </>
      )}
    </Box>
  );
};

export default CharacterCreationLayout;
