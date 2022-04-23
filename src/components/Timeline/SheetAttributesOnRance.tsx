import React from 'react';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import { Box, Chip } from '@mui/material';
import CharacterSheet from '../../interfaces/CharacterSheet';

const SheetAttributesOnRace: React.FC<{ currentSheet: CharacterSheet }> = ({
  currentSheet,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      '& > :not(style)': { m: 1 },
    }}
  >
    <Chip
      icon={<FitnessCenterIcon />}
      label={`Força ${currentSheet.atributos.Força.value} (${currentSheet.atributos.Força.mod})`}
    />
    <Chip
      icon={<DirectionsRunIcon />}
      label={`Destreza ${currentSheet.atributos.Destreza.value} (${currentSheet.atributos.Destreza.mod})`}
    />
    <Chip
      icon={<EmojiPeopleIcon />}
      label={`Constituição ${currentSheet.atributos.Constituição.value} (${currentSheet.atributos.Constituição.mod})`}
    />
    <Chip
      icon={<PsychologyIcon />}
      label={`Inteligência ${currentSheet.atributos.Inteligência.value} (${currentSheet.atributos.Inteligência.mod})`}
    />
    <Chip
      icon={<MenuBookIcon />}
      label={`Sabedoria ${currentSheet.atributos.Sabedoria.value} (${currentSheet.atributos.Sabedoria.mod})`}
    />
    <Chip
      icon={<EmojiEmotionsIcon />}
      label={`Carisma ${currentSheet.atributos.Carisma.value} (${currentSheet.atributos.Carisma.mod})`}
    />
  </Box>
);

export default SheetAttributesOnRace;
