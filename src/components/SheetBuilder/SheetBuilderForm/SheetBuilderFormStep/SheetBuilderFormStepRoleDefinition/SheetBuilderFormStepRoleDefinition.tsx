import { useAppDispatch } from '@/store/hooks';
import { resetFormAlert } from '@/store/slices/sheetBuilder/sheetBuilderSliceForm';
import {
  resetRole,
  selectBuilderRole,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Role, RoleName } from 't20-sheet-builder';
import {
  ConfirmFunction,
  useSheetBuilderConfirm,
} from '../../useSheetBuilderSubmit';
import RoleSelect from './RoleSelect';
import SheetBuilderFormRoleDefinitionArcanist from './SheetBuilderFormRoleDefinitionArcanist/SheetBuilderFormRoleDefinitionArcanist';
import SheetBuilderFormRoleDefinitionWarrior from './SheetBuilderFormRoleDefinitionWarrior/SheetBuilderFormRoleDefinitionWarrior';

export type RoleComponentProps = {
  confirmRole: ConfirmFunction<Role>;
};

const roleComponents: Record<RoleName, React.FC<RoleComponentProps>> = {
  arcanist: SheetBuilderFormRoleDefinitionArcanist,
  warrior: SheetBuilderFormRoleDefinitionWarrior,
  barbarian: SheetBuilderFormRoleDefinitionWarrior,
  bard: SheetBuilderFormRoleDefinitionArcanist,
  buccaneer: SheetBuilderFormRoleDefinitionWarrior,
  cleric: SheetBuilderFormRoleDefinitionArcanist,
  druid: SheetBuilderFormRoleDefinitionArcanist,
  fighter: SheetBuilderFormRoleDefinitionWarrior,
  inventor: SheetBuilderFormRoleDefinitionArcanist,
  knight: SheetBuilderFormRoleDefinitionWarrior,
  noble: SheetBuilderFormRoleDefinitionArcanist,
  paladin: SheetBuilderFormRoleDefinitionWarrior,
  ranger: SheetBuilderFormRoleDefinitionWarrior,
  rogue: SheetBuilderFormRoleDefinitionWarrior,
};

const SheetBuilderFormStepRoleDefinition = () => {
  const submittedRole = useSelector(selectBuilderRole);
  const { confirm } = useSheetBuilderConfirm<Role>();
  const dispatch = useAppDispatch();
  const [role, setRole] = React.useState<RoleName | undefined>(
    submittedRole?.name
  );
  const RoleComponent = role ? roleComponents[role] : null;

  useEffect(() => {
    if (submittedRole) {
      setRole(submittedRole.name);
    }
  }, [submittedRole]);

  const selectRole = (selected: RoleName) => {
    dispatch(resetFormAlert());
    dispatch(resetRole());
    setRole(selected);
  };

  return (
    <div>
      <RoleSelect setRole={selectRole} />
      {RoleComponent && <RoleComponent confirmRole={confirm} />}
    </div>
  );
};

export default SheetBuilderFormStepRoleDefinition;
