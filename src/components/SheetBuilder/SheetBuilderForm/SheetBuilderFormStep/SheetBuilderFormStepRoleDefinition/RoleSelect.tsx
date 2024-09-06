import React from 'react';
import { Option } from '@/components/SheetBuilder/common/Option';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import { useDispatch, useSelector } from 'react-redux';
import { RoleName, Translator } from 't20-sheet-builder';
import { selectBuilderRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';

type Props = {
  setRole(role?: RoleName): void;
};

const rolesOptions = Object.values(RoleName).map<Option<RoleName>>((role) => ({
  value: role,
  label: Translator.getRoleTranslation(role),
}));

const RoleSelect = ({ setRole }: Props) => {
  const role = useSelector(selectBuilderRole);
  const dispatch = useDispatch();
  const selected: Option<RoleName> | undefined = role
    ? rolesOptions.find((option) => option.value === role.name)
    : undefined;
  return (
    <SheetBuilderFormSelect
      options={rolesOptions}
      className='mb-3'
      value={selected}
      onChange={(option) => {
        dispatch(setOptionReady({ key: 'isRoleReady', value: 'pending' }));
        setRole(option?.value);
      }}
      placeholder='Escolha uma classe'
      id='role-select'
    />
  );
};

export default RoleSelect;
