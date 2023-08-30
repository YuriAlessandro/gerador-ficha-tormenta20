import {
  ArcanistLineageDraconicDamageType,
  DamageType,
  SerializedArcanist,
  SerializedArcanistLineageDraconic,
  SerializedArcanistSorcerer,
  Translator,
} from 't20-sheet-builder';
import React, { useEffect } from 'react';
import { Option } from '@/components/SheetBuilder/common/Option';
import { useAppSelector } from '@/store/hooks';
import { selectAttribute } from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import SheetBuilderFormSelect from '@/components/SheetBuilder/SheetBuilderForm/SheetBuilderFormSelect';
import { addSign } from '@/components/SheetBuilder/common/StringHelper';
import { useArcanistFormContext } from '../SheetBuilderFormRoleDefinitionArcanistContext';
import { selectBuilderRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import { useSelector } from 'react-redux';

const damageOptions: Option<ArcanistLineageDraconicDamageType>[] = [
  {
    value: DamageType.acid,
    label: Translator.getDamageTypeTranslation(DamageType.acid),
  },
  {
    value: DamageType.eletricity,
    label: Translator.getDamageTypeTranslation(DamageType.eletricity),
  },
  {
    value: DamageType.fire,
    label: Translator.getDamageTypeTranslation(DamageType.fire),
  },
  {
    value: DamageType.cold,
    label: Translator.getDamageTypeTranslation(DamageType.cold),
  },
];
const SheetBuilderFormRoleDefinitionArcanistSorcererDraconic = () => {
  const {
    sorcererLineageDraconicDamageType,
    setSorcererLineageDraconicDamageType,
  } = useArcanistFormContext();
  const storedArcanist = useSelector(selectBuilderRole) as
    | SerializedArcanist<
        SerializedArcanistSorcerer<SerializedArcanistLineageDraconic>
      >
    | undefined;

  useEffect(() => {
    if (storedArcanist) {
      setSorcererLineageDraconicDamageType(
        storedArcanist.path.lineage.damageType
      );
    }
  }, [storedArcanist]);

  const charisma = useAppSelector(selectAttribute('charisma'));

  const selectedValue = damageOptions.find(
    (option) => option.value === sorcererLineageDraconicDamageType
  );
  return (
    <div className='mb-3'>
      <ul className='mb-3'>
        <li className='mb-1'>
          Você soma seu carisma ({addSign(charisma)}) em seus pontos de vida
        </li>
        <li className='mb-1'>
          Você recebe redução de dano 5 ao tipo escolhido
        </li>
      </ul>
      <SheetBuilderFormSelect
        id='arcanist-sorcerer-draconic-damage-type'
        options={damageOptions}
        placeholder='Escolha um tipo de dano'
        value={selectedValue}
        onChange={(option) =>
          setSorcererLineageDraconicDamageType(option?.value)
        }
      />
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionArcanistSorcererDraconic;
