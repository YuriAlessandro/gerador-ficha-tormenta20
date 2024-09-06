/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useParams } from 'react-router';
import { SelectSkillGroup, SkillName, Translator } from 't20-sheet-builder';
import { getSkills } from '@/components/SheetBuilder/common/SkillsFilter';
import { useDispatch, useSelector } from 'react-redux';
import { selectPreviewSkills } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';

type Props = {
  skillGroup: SelectSkillGroup;
  setGroupSelectedSkills: (skills: SkillName[]) => void;
  selectedSkills: SkillName[];
};

const SkillGroupSelect = ({
  skillGroup,
  setGroupSelectedSkills: setSelectedSkills,
  selectedSkills,
}: Props) => {
  const options = skillGroup.skills.map((skill) => ({
    value: skill,
    label: Translator.getSkillTranslation(skill),
  }));
  const dispatch = useDispatch();
  const params = useParams<{ id: string }>();
  const skills = getSkills(
    Object.entries(useSelector(selectPreviewSkills(params.id)))
  );

  const onChangeSkill = (newValues: any) => {
    dispatch(setOptionReady({ key: 'isRoleReady', value: 'pending' }));

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
        {skillGroup.amount > 1 ? 'perícias' : 'perícia'} (
        {selectedSkills.length}/{skillGroup.amount})
      </p>
      <SheetBuilderFormSelect
        isMulti
        onChange={onChangeSkill}
        options={options}
        value={options.filter((option) =>
          selectedSkills.includes(option.value)
        )}
        placeholder={`Opções: ${skillGroup.skills
          .map((skill) => Translator.getSkillTranslation(skill))
          .join(', ')}`}
        className='mb-3'
        id='skill-group-select'
        isOptionDisabled={(option) =>
          selectedSkills.length >= skillGroup.amount ||
          skills.includes(option.value)
        }
      />
    </div>
  );
};

export default SkillGroupSelect;
