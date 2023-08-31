import ConfirmButton from '@/components/SheetBuilder/SheetBuilderForm/ConfirmButton';
import { updateItemByIndex } from '@/components/SheetBuilder/common/Immutable';
import { submitRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import React, { useState } from 'react';
import { SkillName, Warrior } from 't20-sheet-builder';
import { RoleComponentProps } from '../SheetBuilderFormStepRoleDefinition';
import SkillGroupSelect from '../SkillGroupSelect';

const SheetBuilderFormRoleDefinitionWarrior: React.FC<RoleComponentProps> = ({
  confirmRole,
}) => {
  const skillGroupsLength = Warrior.selectSkillGroups.length;
  const initialSelectedSkillsByGroup = Array.from(
    { length: skillGroupsLength },
    () => []
  );
  const [selectedSkillsByGroup, setSelectedSkillsByGroup] = useState<
    SkillName[][]
  >(initialSelectedSkillsByGroup);
  const makeWarrior = () => new Warrior(selectedSkillsByGroup);
  const createSubmitAction = (warrior: Warrior) =>
    submitRole(warrior.serialize());
  const confirmWarrior = () => {
    confirmRole(makeWarrior, createSubmitAction, 'isRoleReady');
  };

  const setGroupSelectedSkills = (
    selected: SkillName[],
    groupIndex: number
  ) => {
    const updated = updateItemByIndex(
      selectedSkillsByGroup,
      selected,
      groupIndex
    );
    setSelectedSkillsByGroup(updated);
  };

  return (
    <div>
      {Warrior.selectSkillGroups.map((skillGroup, index) => (
        <SkillGroupSelect
          skillGroup={skillGroup}
          key={skillGroup.skills.join('-')}
          setGroupSelectedSkills={(selected) =>
            setGroupSelectedSkills(selected, index)
          }
        />
      ))}
      <ConfirmButton confirm={confirmWarrior} />
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionWarrior;
