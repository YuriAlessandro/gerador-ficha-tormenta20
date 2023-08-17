import React from 'react';
import { QareenType } from 't20-sheet-builder';
import { useDispatch } from 'react-redux';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import SheetBuilderFormSelect from '../../../SheetBuilderFormSelect';

interface IProps {
  setType: (type: QareenType) => void;
}

const SheetBuildFormStepRaceDefinitionQareenType: React.FC<IProps> = ({
  setType,
}) => {
  const dispatch = useDispatch();

  const options = [
    {
      label: 'Água',
      value: 'water',
    },
    {
      label: 'Fogo',
      value: 'fire',
    },
    {
      label: 'Ar',
      value: 'air',
    },
    {
      label: 'Terra',
      value: 'earth',
    },
    {
      label: 'Luz',
      value: 'light',
    },
    {
      label: 'Trevas',
      value: 'darkness',
    },
  ];

  return (
    <div className='mb-6'>
      <h3 className='mb-3'>Tatuagem Mística</h3>
      <div>
        <SheetBuilderFormSelect
          placeholder='Escolha uma magia'
          className='mb-3'
          options={options}
          onChange={(option) => {
            dispatch(setOptionReady({ key: 'isRaceReady', value: 'pending' }));
            setType(option.value as QareenType);
          }}
          id='qareen-spell-selection'
        />
      </div>
    </div>
  );
};

export default SheetBuildFormStepRaceDefinitionQareenType;
