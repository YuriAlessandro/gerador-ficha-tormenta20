import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectPreviewMaxLifePoints,
  selectPreviewMaxManaPoints,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import SheetPreviewItem from './SheetPreviewValueItem';

const SheetPreviewPoints = () => {
  const lifePoints = useSelector(selectPreviewMaxLifePoints);
  const manaPoints = useSelector(selectPreviewMaxManaPoints);

  return (
    <div className='flex justify-center gap-3'>
      <SheetPreviewItem label='Pontos de vida' value={lifePoints} />
      <SheetPreviewItem label='Pontos de mana' value={manaPoints} />
    </div>
  );
};

export default SheetPreviewPoints;
