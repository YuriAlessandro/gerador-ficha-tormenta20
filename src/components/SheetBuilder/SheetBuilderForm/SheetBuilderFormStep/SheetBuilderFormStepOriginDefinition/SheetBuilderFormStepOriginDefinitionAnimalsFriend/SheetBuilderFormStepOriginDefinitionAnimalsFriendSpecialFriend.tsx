import React from 'react';
import { SkillName } from 't20-sheet-builder';
import { skillsOptions } from '@/components/SheetBuilder/common/Options';
import { useSelector } from 'react-redux';
import { getSkills } from '@/components/SheetBuilder/common/SkillsFilter';
import { selectPreviewSkills } from '@/store/slices/sheetBuilder/sheetBuilderSliceSheetPreview';
import SheetBuilderFormSelect from '../../../SheetBuilderFormSelect';

type Props = {
  selectSkill: (skill?: SkillName) => void;
};

const options = skillsOptions.filter(
  (option) => option.value !== SkillName.aim && option.value !== SkillName.fight
);

const SheetBuilderFormStepOriginDefinitionAnimalsFriendSpecialFriend: React.FC<
  Props
> = ({ selectSkill }) => {
  const skills = getSkills(Object.entries(useSelector(selectPreviewSkills)));

  return (
    <div>
      <p className='mb-2'>Seu amigo especial fornece +2 em uma perícia</p>
      <SheetBuilderFormSelect
        options={options}
        onChange={(option) => selectSkill(option?.value)}
        id='special-friend-skills'
        placeholder='Escolha uma perícia'
        className='mb-3'
        isOptionDisabled={(option) => skills.includes(option.value)}
      />
    </div>
  );
};

export default SheetBuilderFormStepOriginDefinitionAnimalsFriendSpecialFriend;
