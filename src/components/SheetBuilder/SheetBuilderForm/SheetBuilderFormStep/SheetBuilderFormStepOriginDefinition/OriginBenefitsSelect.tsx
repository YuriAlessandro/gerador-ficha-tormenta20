import React from 'react';
import {
  OriginBenefits,
  SerializedOriginBenefits,
  Translator,
} from 't20-sheet-builder';
import { getSkills } from '@/components/SheetBuilder/common/SkillsFilter';
import { useSelector } from 'react-redux';
import { selectPreviewSkills } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';
import { Option } from '../../../common/Option';

export type OriginBenefitOption = Pick<
  SerializedOriginBenefits,
  'name' | 'type'
>;

type OriginBenefitOptionType = OriginBenefitOption['type'];

type Props = {
  benefits: OriginBenefits;
  setBenefits(benefits: OriginBenefitOption[]): void;
};

const OriginBenefitsSelect = ({ benefits, setBenefits }: Props) => {
  const skills = getSkills(Object.entries(useSelector(selectPreviewSkills)));

  const options: Option<OriginBenefitOption>[] = [
    ...benefits.generalPowers.map((power) => ({
      label: Translator.getPowerTranslation(power),
      value: { type: 'generalPowers' as OriginBenefitOptionType, name: power },
    })),
    ...benefits.skills.map((skill) => ({
      label: Translator.getSkillTranslation(skill),
      value: { type: 'skills' as OriginBenefitOptionType, name: skill },
    })),
    {
      label: Translator.getPowerTranslation(benefits.originPower),
      value: { type: 'originPower', name: benefits.originPower },
    },
  ];

  return (
    <div>
      <p className='mb-2'>Escolha dois benefícios</p>
      <SheetBuilderFormSelect
        options={options}
        isMulti
        onChange={(selected) =>
          setBenefits(selected.map((option) => option.value))
        }
        className='mb-3'
        placeholder='Escolha entre perícias e poderes'
        id='origin-benefits-select'
        isOptionDisabled={(option) => skills.includes(option.value.name)}
      />
    </div>
  );
};

export default OriginBenefitsSelect;
