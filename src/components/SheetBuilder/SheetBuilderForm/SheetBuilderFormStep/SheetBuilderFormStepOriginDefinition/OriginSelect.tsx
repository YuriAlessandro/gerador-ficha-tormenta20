import React from 'react';
import { OriginName, Translator } from 't20-sheet-builder';
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

const OriginSelect = ({ setOrigin }: Props) => (
  <SheetBuilderFormSelect
    options={originOptions}
    onChange={(option) => setOrigin(option?.value)}
    className='mb-3'
    id='origin-select'
    placeholder='Escolha uma origem'
  />
);

export default OriginSelect;
