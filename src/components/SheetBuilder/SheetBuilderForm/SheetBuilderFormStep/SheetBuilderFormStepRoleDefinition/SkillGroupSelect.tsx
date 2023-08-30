/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { SelectSkillGroup, SkillName, Translator } from 't20-sheet-builder';
import { getSkills } from '@/components/SheetBuilder/common/SkillsFilter';
import { useDispatch, useSelector } from 'react-redux';
import { selectPreviewSkills } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';
import { selectBuilderRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';

type Props = {
  skillGroup: SelectSkillGroup;
  setGroupSelectedSkills: (skills: SkillName[]) => void;
};

const SkillGroupSelect = ({
  skillGroup,
  setGroupSelectedSkills: setSelectedSkills,
}: Props) => {
  const options = skillGroup.skills.map((skill) => ({
    value: skill,
    label: Translator.getSkillTranslation(skill),
  }));
  const dispatch = useDispatch();
  const skills = getSkills(Object.entries(useSelector(selectPreviewSkills)));

  const [selectedAmount, setSelectedAmount] = useState(0);

  const onChangeSkill = (newValues: any) => {
    dispatch(setOptionReady({ key: 'isRoleReady', value: 'pending' }));
    setSelectedAmount(newValues.length);

    if (newValues.length === 1) {
      setSelectedSkills([newValues[0].value]);
    } else if (newValues.length > 1) {
      setSelectedSkills(
        newValues.map((option: { value: any }) => option.value)
      );
    } else if (newValues.length === 0) {
      setSelectedSkills([]);
    }
  };

  return (
    <div>
      <p>
        Escolha {skillGroup.amount}{' '}
        {skillGroup.amount > 1 ? 'perícias' : 'perícia'} ({selectedAmount}/
        {skillGroup.amount})
      </p>
      <SheetBuilderFormSelect
        isMulti
        onChange={onChangeSkill}
        options={options}
        placeholder={`Opções: ${skillGroup.skills
          .map((skill) => Translator.getSkillTranslation(skill))
          .join(', ')}`}
        className='mb-3'
        id='skill-group-select'
        isOptionDisabled={(option) =>
          selectedAmount >= skillGroup.amount || skills.includes(option.value)
        }
      />
    </div>
  );
};

export default SkillGroupSelect;
