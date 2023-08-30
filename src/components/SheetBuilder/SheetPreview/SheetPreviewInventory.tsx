import { useSelector } from 'react-redux';
import { Translator } from 't20-sheet-builder';
import React from 'react';
import { selectPreviewInventory } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { Chip, Stack } from '@mui/material';
import BookTitle from '../common/BookTitle';

const SheetPreviewInventory = () => {
  const equipments = useSelector(selectPreviewInventory);

  return (
    <>
      <BookTitle>Equipamentos</BookTitle>
      {equipments.length === 0 && <p>Nenhum equipamento.</p>}
      <Stack direction='row' flexWrap='wrap' spacing={2}>
        {equipments.map((equipment) => (
          <Chip
            key={equipment.name}
            label={Translator.getEquipmentTranslation(equipment.name)}
          />
        ))}
      </Stack>
    </>
  );
};

export default SheetPreviewInventory;
