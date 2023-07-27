import { useSelector } from 'react-redux';
import React from 'react';
import { selectPreviewSpells } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { Box } from '@mui/material';
import SheetPreviewSpell from './SheetPreviewSpell';
import BookTitle from '../common/BookTitle';

const SheetPreviewSpells = () => {
  const spells = useSelector(selectPreviewSpells);

  return (
    <Box>
      <BookTitle>Magias</BookTitle>
      {spells.length === 0 && <p>Nenhuma magia.</p>}
      {spells.map((spell) => (
        <SheetPreviewSpell key={spell.name} spell={spell} />
      ))}
    </Box>
  );
};

export default SheetPreviewSpells;
