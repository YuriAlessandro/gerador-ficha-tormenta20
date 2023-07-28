import React from 'react';
import {
  GeneralPowerName,
  SkillName,
  VersatileChoiceType,
} from 't20-sheet-builder';
import { Option } from '@/components/SheetBuilder/common/Option';
import {
  generalPowerOptions,
  skillsOptions,
} from '@/components/SheetBuilder/common/Options';
import SheetBuilderFormSelect from '@/components/SheetBuilder/SheetBuilderForm/SheetBuilderFormSelect';
import { useSelector } from 'react-redux';
import { selectPreviewSkills } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { getSkills } from '@/components/SheetBuilder/common/SkillsFilter';

const secondVersatilOptionTypeOptions: Option<VersatileChoiceType>[] = [
  { label: 'Poder', value: 'power' },
  { label: 'Perícia', value: 'skill' },
];

type Props = {
  secondVersatileOptionType?: VersatileChoiceType;
  setFirstVersatileOption(option?: SkillName): void;
  setSecondVersatileOption(option?: SkillName | GeneralPowerName): void;
  setSecondVersatileOptionType(option?: VersatileChoiceType): void;
};

const SheetBuilderFormStepRaceDefinitionHumanVersatile = ({
  secondVersatileOptionType,
  setFirstVersatileOption,
  setSecondVersatileOption,
  setSecondVersatileOptionType,
}: Props) => {
  const skills = getSkills(Object.entries(useSelector(selectPreviewSkills)));

  return (
    <div className='mb-6'>
      <h3 className='mb-3'>Versátil</h3>
      <div>
        <SheetBuilderFormSelect
          placeholder='1 - Escolha uma perícia'
          className='mb-3'
          options={skillsOptions}
          onChange={(option) => setFirstVersatileOption(option?.value)}
          id='first-versatile-option-select'
        />
        <SheetBuilderFormSelect
          options={secondVersatilOptionTypeOptions}
          onChange={(option) => {
            setSecondVersatileOptionType(option?.value);
            setSecondVersatileOption(undefined);
          }}
          className='mb-3'
          placeholder='2 - Escolha perícia ou poder'
          id='second-versatile-option-type-select'
        />
        {secondVersatileOptionType === 'power' && (
          <SheetBuilderFormSelect
            options={generalPowerOptions}
            placeholder='2 - Escolha um poder'
            onChange={(option) => setSecondVersatileOption(option.value)}
            isSearcheable
            id='second-versatile-option-power-select'
          />
        )}
        {secondVersatileOptionType === 'skill' && (
          <SheetBuilderFormSelect
            options={skillsOptions}
            placeholder='2 - Escolha uma perícia'
            onChange={(option) => setSecondVersatileOption(option?.value)}
            isSearcheable
            id='second-versatile-option-skill-select'
            isOptionDisabled={(option) => skills.includes(option.value)}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(SheetBuilderFormStepRaceDefinitionHumanVersatile);
