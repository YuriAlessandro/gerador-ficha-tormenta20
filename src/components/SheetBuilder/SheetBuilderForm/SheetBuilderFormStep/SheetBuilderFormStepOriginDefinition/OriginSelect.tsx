import React from 'react';
import { OriginName, Translator } from 't20-sheet-builder';
import { useDispatch } from 'react-redux';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';
import { Option } from '../../../common/Option';

type Props = {
  setOrigin: (origin?: OriginName) => void;
};

const originOptions: Option<OriginName>[] = Object.values(OriginName).map(
  (originName) => ({
    label: Translator.getOriginTranslation(originName),
    value: originName,
  })
);

const OriginSelect = ({ setOrigin }: Props) => {
  const dispatch = useDispatch();
  return (
    <SheetBuilderFormSelect
      options={originOptions}
      onChange={(option) => {
        dispatch(setOptionReady({ key: 'isOriginReady', value: 'pending' }));
        setOrigin(option?.value);
      }}
      className='mb-3'
      id='origin-select'
      placeholder='Escolha uma origem'
    />
  );
};

export default OriginSelect;
