import React from 'react';
import { SkillName } from 't20-sheet-builder';
import SheetBuilderFormSelect from '../../../SheetBuilderFormSelect';
import { skillsOptions } from '../../../../common/Options';

type Props = {
  selectSkill: (skill?: SkillName) => void;
};

const options = skillsOptions.filter(
  (option) => option.value !== SkillName.aim && option.value !== SkillName.fight
);

const SheetBuilderFormStepOriginDefinitionAnimalsFriendSpecialFriend: React.FC<
  Props
> = ({ selectSkill }) => (
  <div>
    <p className='mb-2'>Seu amigo especial fornece +2 em uma perícia</p>
    <SheetBuilderFormSelect
      options={options}
      onChange={(option) => selectSkill(option?.value)}
      id='special-friend-skills'
      placeholder='Escolha uma perícia'
      className='mb-3'
    />
  </div>
);

export default SheetBuilderFormStepOriginDefinitionAnimalsFriendSpecialFriend;
