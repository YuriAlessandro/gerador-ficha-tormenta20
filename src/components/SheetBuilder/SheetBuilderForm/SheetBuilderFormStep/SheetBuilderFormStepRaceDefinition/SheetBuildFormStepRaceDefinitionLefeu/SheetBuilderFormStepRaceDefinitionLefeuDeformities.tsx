import React from 'react';
import { SkillName } from 't20-sheet-builder';
import { skillsOptions } from '@/components/SheetBuilder/common/Options';
import SheetBuilderFormSelect from '@/components/SheetBuilder/SheetBuilderForm/SheetBuilderFormSelect';
import { useDispatch, useSelector } from 'react-redux';
import { selectPreviewSkills } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { getSkills } from '@/components/SheetBuilder/common/SkillsFilter';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';

type Props = {
  setDeformitiesOption(options: SkillName[]): void;
  deformities: SkillName[];
};

const SheetBuilderFormStepRaceDefinitionLefeuDeformities = ({
  setDeformitiesOption,
  deformities,
}: Props) => {
  const skills = getSkills(Object.entries(useSelector(selectPreviewSkills)));
  const dispatch = useDispatch();
  return (
    <div className='mb-6'>
      <h3 className='mb-3'>Deformidades</h3>
      <div>
        <SheetBuilderFormSelect
          isMulti
          placeholder='Escolha duas perícias'
          className='mb-3'
          options={skillsOptions}
          onChange={(options) => {
            dispatch(setOptionReady({ key: 'isRaceReady', value: 'pending' }));
            setDeformitiesOption(options?.map((option) => option.value));
          }}
          id='first-versatile-option-select'
          isOptionDisabled={(option) =>
            skills.includes(option.value) || deformities.length >= 2
          }
        />
      </div>
    </div>
  );
};

export default React.memo(SheetBuilderFormStepRaceDefinitionLefeuDeformities);
