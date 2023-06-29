import { useSelector } from 'react-redux';
import { Translator } from 't20-sheet-builder';
import React from 'react';
import { selectPreviewInventory } from '../../../store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';

const SheetPreviewInventory = () => {
  const equipments = useSelector(selectPreviewInventory);

  return (
    <div>
      <h3 className='mb-5 font-bold'>Equipamentos</h3>
      <ul className='flex flex-wrap gap-4 justify-center'>
        {equipments.map((equipment) => (
          <li
            className='py-2 px-4 bg-white rounded-2xl text-slate-950 text-sm'
            key={equipment.name}
          >
            {Translator.getEquipmentTranslation(equipment.name)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SheetPreviewInventory;
