import React, { useState } from 'react';
import { RoleName, SkillName, Warrior } from 't20-sheet-builder';
import { submitRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import { updateItemByIndex } from '@/components/SheetBuilder/common/Immutable';
import ConfirmButton from '@/components/SheetBuilder/SheetBuilderForm/ConfirmButton';
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
  const makeWarrior = () => new Warrior(selectedSkillsByGroup.flat());
  const createSubmitAction = (warrior: Warrior) =>
    submitRole({
      chosenSkills: warrior.chosenSkills,
      name: RoleName.warrior,
    });
  const confirmWarrior = () => {
    confirmRole(makeWarrior, createSubmitAction);
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
