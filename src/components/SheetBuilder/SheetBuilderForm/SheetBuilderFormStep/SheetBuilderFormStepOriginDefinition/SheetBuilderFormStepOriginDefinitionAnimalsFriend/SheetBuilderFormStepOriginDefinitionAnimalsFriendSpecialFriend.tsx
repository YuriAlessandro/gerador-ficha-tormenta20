import React from 'react';
import { SkillName } from 't20-sheet-builder';
import { skillsOptions } from '@/components/SheetBuilder/common/Options';
import SheetBuilderFormSelect from '../../../SheetBuilderFormSelect';

type Props = {
  selectSkill: (skill?: SkillName) => void;
  selectedSpecialFriendSkill: SkillName | undefined;
};

const options = skillsOptions.filter(
  (option) => option.value !== SkillName.aim && option.value !== SkillName.fight
);

const SheetBuilderFormStepOriginDefinitionAnimalsFriendSpecialFriend: React.FC<
  Props
> = ({ selectSkill, selectedSpecialFriendSkill }) => (
  <div>
    <p className='mb-2'>Seu amigo especial fornece +2 em uma perícia</p>
    <SheetBuilderFormSelect
      options={options}
      value={options.find(
        (option) => option.value === selectedSpecialFriendSkill
      )}
      onChange={(option) => selectSkill(option?.value)}
      id='special-friend-skills'
      placeholder='Escolha uma perícia'
      className='mb-3'
    />
  </div>
);

export default SheetBuilderFormStepOriginDefinitionAnimalsFriendSpecialFriend;
