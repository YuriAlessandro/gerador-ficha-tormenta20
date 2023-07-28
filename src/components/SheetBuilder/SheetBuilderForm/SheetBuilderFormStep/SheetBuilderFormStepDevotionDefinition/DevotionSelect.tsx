import React from 'react';
import { DeityName, Translator } from 't20-sheet-builder';
import { useDispatch } from 'react-redux';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';
import { Option } from '../../../common/Option';

interface Props {
  setDevotion: (devotion?: DeityName) => void;
}

const DevotionSelect: React.FC<Props> = ({ setDevotion }) => {
  const dispatch = useDispatch();
  const devotionOptions: Option<DeityName>[] = Object.values(DeityName)
    .filter((name) => name === DeityName.linwuh)
    .map((deityName) => ({
      label: Translator.getTranslation(deityName),
      value: deityName,
    }));

  return (
    <SheetBuilderFormSelect
      options={devotionOptions}
      onChange={(option) => {
        dispatch(setOptionReady({ key: 'isDevotionReady', value: 'pending' }));
        setDevotion(option?.value);
      }}
      className='mb-3'
      id='devotion-select'
      placeholder='Escolha uma divindade'
    />
  );
};

export default DevotionSelect;
