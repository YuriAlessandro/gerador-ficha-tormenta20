import { useSelector } from 'react-redux';
import React from 'react';
import { useParams } from 'react-router';
import { selectPreviewSpells } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { Box } from '@mui/material';
import SheetPreviewSpell from './SheetPreviewSpell';
import BookTitle from '../common/BookTitle';

const SheetPreviewSpells = () => {
  const params = useParams<{ id: string }>();
  const spells = useSelector(selectPreviewSpells(params.id));

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
