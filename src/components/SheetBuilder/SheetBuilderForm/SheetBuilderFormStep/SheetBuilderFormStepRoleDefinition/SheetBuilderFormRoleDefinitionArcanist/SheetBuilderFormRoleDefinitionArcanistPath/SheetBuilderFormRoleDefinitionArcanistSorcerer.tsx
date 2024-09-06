import React, { useEffect } from 'react';
import {
  ArcanistLineageType,
  ArcanistPathName,
  SerializedArcanist,
  SerializedArcanistSorcerer,
} from 't20-sheet-builder';
import SheetBuilderFormSelect from '@/components/SheetBuilder/SheetBuilderForm/SheetBuilderFormSelect';
import { selectBuilderRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import { useSelector } from 'react-redux';
import SheetBuilderFormRoleDefinitionArcanistSorcererDraconic from './SheetBuilderFormRoleDefinitionArcanistSorcererDraconic';
import SheetBuilderFormRoleDefinitionArcanistSorcererFaerie from './SheetBuilderFormRoleDefinitionArcanistSorcererFaerie';
import SheetBuilderFormRoleDefinitionArcanistSorcererRed from './SheetBuilderFormRoleDefinitionArcanistSorcererRed';
import { useArcanistFormContext } from '../SheetBuilderFormRoleDefinitionArcanistContext';

const lineageTranslations: Record<ArcanistLineageType, string> = {
  draconic: 'Dracônica',
  faerie: 'Feérica',
  red: 'Rubra',
};

const lineageComponents: Record<ArcanistLineageType, React.FC> = {
  draconic: SheetBuilderFormRoleDefinitionArcanistSorcererDraconic,
  faerie: SheetBuilderFormRoleDefinitionArcanistSorcererFaerie,
  red: SheetBuilderFormRoleDefinitionArcanistSorcererRed,
};

const SheetBuilderFormRoleDefinitionArcanistSorcerer = () => {
  const storedArcanist = useSelector(selectBuilderRole) as
    | SerializedArcanist<SerializedArcanistSorcerer>
    | undefined;
  const { sorcererLineage, setSorcererLineage } = useArcanistFormContext();
  const LineageComponent = sorcererLineage
    ? lineageComponents[sorcererLineage]
    : null;

  useEffect(() => {
    if (
      storedArcanist &&
      storedArcanist.path.name === ArcanistPathName.sorcerer
    )
      setSorcererLineage(storedArcanist.path.lineage.type);
  }, [storedArcanist]);

  const options = Object.values(ArcanistLineageType).map((lineage) => ({
    value: lineage,
    label: lineageTranslations[lineage],
  }));

  const selectedValue = options.find(
    (option) => option.value === sorcererLineage
  );

  return (
    <div>
      <p>Você possui uma linhagem sobrenatural</p>
      <SheetBuilderFormSelect
        options={options}
        value={selectedValue}
        onChange={(option) => setSorcererLineage(option?.value)}
        className='mb-3'
        placeholder='Escolha uma linhagem'
        id='arcanist-sorcerer-lineage-select'
      />
      {LineageComponent && <LineageComponent />}
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionArcanistSorcerer;
