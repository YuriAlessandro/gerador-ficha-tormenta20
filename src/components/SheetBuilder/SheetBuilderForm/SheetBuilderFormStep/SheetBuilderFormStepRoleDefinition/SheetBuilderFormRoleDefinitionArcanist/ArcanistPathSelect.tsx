import { ArcanistPathName, Translator } from 't20-sheet-builder';
import React from 'react';
import SheetBuilderFormSelect from '@/components/SheetBuilder/SheetBuilderForm/SheetBuilderFormSelect';
import { Option } from '@/components/SheetBuilder/common/Option';

type Props = {
  setPath(path?: ArcanistPathName): void;
  path: ArcanistPathName | undefined;
};

const pathsOptions: Option<ArcanistPathName>[] = Object.values(
  ArcanistPathName
).map<Option<ArcanistPathName>>((path) => ({
  label: Translator.getTranslation(path),
  value: path,
}));

const ArcanistPathSelect = ({ setPath, path }: Props) => {
  const selectedPath = pathsOptions.find((option) => option.value === path);
  return (
    <SheetBuilderFormSelect
      options={pathsOptions}
      value={selectedPath}
      onChange={(option) => setPath(option?.value)}
      className='mb-3'
      placeholder='Escolha um caminho'
      id='arcanist-path-select'
    />
  );
};

export default ArcanistPathSelect;
