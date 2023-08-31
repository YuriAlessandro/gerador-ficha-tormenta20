import React from 'react';
import { OriginName, Translator } from 't20-sheet-builder';
import { useDispatch } from 'react-redux';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';
import { Option } from '../../../common/Option';

type Props = {
  setOrigin: (origin?: OriginName) => void;
  origin: OriginName | undefined;
};

const originOptions: Option<OriginName>[] = Object.values(OriginName).map(
  (originName) => ({
    label: Translator.getOriginTranslation(originName),
    value: originName,
  })
);

const OriginSelect = ({ setOrigin, origin }: Props) => {
  const dispatch = useDispatch();

  const selectedOrigin = originOptions.find(
    (option) => option.value === origin
  );

  return (
    <SheetBuilderFormSelect
      options={originOptions}
      value={selectedOrigin}
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
