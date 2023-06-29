import { useSelector } from 'react-redux';
import React from 'react';
import SheetPreviewList from './SheetPreviewList';
import SheetPreviewSpell from './SheetPreviewSpell';
import { selectPreviewSpells } from '../../../store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';

const SheetPreviewSpells = () => {
  const spells = useSelector(selectPreviewSpells);

  return (
    <div>
      <SheetPreviewList
        emptyText='Nenhuma magia.'
        isEmpty={spells.length === 0}
        list={
          <ul className='flex flex-col justify-center gap-3'>
            {spells.map((spell) => (
              <SheetPreviewSpell key={spell.name} spell={spell} />
            ))}
          </ul>
        }
      />
    </div>
  );
};

export default SheetPreviewSpells;
