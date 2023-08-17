import React from 'react';
import { SpellName } from 't20-sheet-builder';
import { spellsOptions } from '@/components/SheetBuilder/common/Options';
import { useDispatch } from 'react-redux';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import SheetBuilderFormSelect from '../../../SheetBuilderFormSelect';

interface IProps {
  setSpell: (spell: SpellName) => void;
}

const SheetBuildFormStepRaceDefinitionQareenSpell: React.FC<IProps> = ({
  setSpell,
}) => {
  const dispatch = useDispatch();
  return (
    <div className='mb-6'>
      <h3 className='mb-3'>Tatuagem Mística</h3>
      <div>
        <SheetBuilderFormSelect
          placeholder='Escolha uma magia'
          className='mb-3'
          options={spellsOptions}
          onChange={(option) => {
            dispatch(setOptionReady({ key: 'isRaceReady', value: 'pending' }));
            setSpell(option.value);
          }}
          id='qareen-spell-selection'
        />
      </div>
    </div>
  );
};

export default SheetBuildFormStepRaceDefinitionQareenSpell;
