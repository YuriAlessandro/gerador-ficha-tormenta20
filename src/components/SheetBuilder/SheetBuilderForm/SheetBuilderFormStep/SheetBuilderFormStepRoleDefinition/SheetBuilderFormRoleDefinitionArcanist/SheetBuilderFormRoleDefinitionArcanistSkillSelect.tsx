import { Arcanist, SerializedRole, SkillName } from 't20-sheet-builder';
import React, { useEffect, useState } from 'react';
import { selectBuilderRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import { useSelector } from 'react-redux';
import { updateItemByIndex } from '@/components/SheetBuilder/common/Immutable';
import SkillGroupSelect from '../SkillGroupSelect';
import { useArcanistFormContext } from './SheetBuilderFormRoleDefinitionArcanistContext';

const SheetBuilderFormRoleDefinitionArcanistSkillSelect = () => {
  const { updateSkillGroup } = useArcanistFormContext();
  const storedRole = useSelector(selectBuilderRole) as SerializedRole;

  const skillGroupsLength = Arcanist.selectSkillGroups.length;
  const initialSelectedSkillsByGroup = Array.from(
    { length: skillGroupsLength },
    () => []
  );
  const [selectedSkillsByGroup, setSelectedSkillsByGroup] = useState<
    SkillName[][]
  >(initialSelectedSkillsByGroup);

  useEffect(() => {
    if (storedRole) setSelectedSkillsByGroup(storedRole.selectedSkillsByGroup);
  }, [storedRole?.selectedSkillsByGroup]);

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
    updateSkillGroup(selected, groupIndex);
  };

  return (
    <div>
      {Arcanist.selectSkillGroups.map((skillGroup, index) => (
        <SkillGroupSelect
          selectedSkills={
            selectedSkillsByGroup ? selectedSkillsByGroup[index] : []
          }
          setGroupSelectedSkills={(selected) =>
            setGroupSelectedSkills(selected, index)
          }
          skillGroup={skillGroup}
          key={skillGroup.skills.join('-')}
        />
      ))}
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionArcanistSkillSelect;
