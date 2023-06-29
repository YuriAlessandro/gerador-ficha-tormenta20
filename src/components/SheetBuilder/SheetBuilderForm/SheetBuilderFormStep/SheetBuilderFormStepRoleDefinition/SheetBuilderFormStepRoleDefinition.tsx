import React from 'react';
import { RoleName } from 't20-sheet-builder';
import { Role } from 't20-sheet-builder/build/domain/entities/Role/Role';
import { useAppDispatch } from '@/store/hooks';
import { resetFormAlert } from '@/store/slices/sheetBuilder/sheetBuilderSliceForm';
import { resetRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
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
};

const SheetBuilderFormStepRoleDefinition = () => {
  const { confirm } = useSheetBuilderConfirm<Role>();
  const dispatch = useAppDispatch();
  const [role, setRole] = React.useState<RoleName>();
  const RoleComponent = role ? roleComponents[role] : null;

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
