import {
  ArcanistLineageDraconicDamageType,
  DamageType,
  Translator,
} from 't20-sheet-builder';
import React from 'react';
import { useArcanistFormContext } from '../SheetBuilderFormRoleDefinitionArcanistContext';
import { Option } from '../../../../../common/Option';
import { useAppSelector } from '../../../../../../../store/hooks';
import { selectAttribute } from '../../../../../../../store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import SheetBuilderFormSelect from '../../../../SheetBuilderFormSelect';
import { addSign } from '../../../../../common/StringHelper';

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
  const charisma = useAppSelector(selectAttribute('charisma'));
  const { setSorcererLineageDraconicDamageType } = useArcanistFormContext();
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
        onChange={(option) =>
          setSorcererLineageDraconicDamageType(option?.value)
        }
      />
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionArcanistSorcererDraconic;
