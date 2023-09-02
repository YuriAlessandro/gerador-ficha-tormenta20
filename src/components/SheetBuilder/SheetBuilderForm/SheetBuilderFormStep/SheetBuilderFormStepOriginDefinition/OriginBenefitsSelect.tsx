import React from 'react';
import {
  OriginBenefits,
  SerializedOriginBenefits,
  Translator,
} from 't20-sheet-builder';
import { getSkills } from '@/components/SheetBuilder/common/SkillsFilter';
import { useDispatch, useSelector } from 'react-redux';
import { selectPreviewSkills } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
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
  selectedBenefits: OriginBenefitOption[];
};

const OriginBenefitsSelect = ({
  benefits,
  setBenefits,
  selectedBenefits,
}: Props) => {
  const skills = getSkills(Object.entries(useSelector(selectPreviewSkills)));
  const dispatch = useDispatch();

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

  const selectedValues = options.filter((option) =>
    selectedBenefits.find((benefit) => benefit.name === option.value.name)
  );

  return (
    <div>
      <p className='mb-2'>Escolha dois benefícios</p>
      <SheetBuilderFormSelect
        options={options}
        isMulti
        value={selectedValues}
        onChange={(selected) => {
          dispatch(setOptionReady({ key: 'isOriginReady', value: 'pending' }));
          setBenefits(selected.map((option) => option.value));
        }}
        className='mb-3'
        placeholder='Escolha entre perícias e poderes'
        id='origin-benefits-select'
        isOptionDisabled={(option) => skills.includes(option.value.name)}
      />
    </div>
  );
};

export default OriginBenefitsSelect;
