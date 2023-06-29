import React from 'react';
import { RoleName, Translator } from 't20-sheet-builder';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';
import { Option } from '../../../common/Option';

type Props = {
  setRole(role?: RoleName): void;
};

const rolesOptions = Object.values(RoleName).map<Option<RoleName>>((role) => ({
  value: role,
  label: Translator.getRoleTranslation(role),
}));

const RoleSelect = ({ setRole }: Props) => (
  <SheetBuilderFormSelect
    options={rolesOptions}
    className='mb-3'
    onChange={(option) => setRole(option?.value)}
    placeholder='Escolha uma classe'
    id='role-select'
  />
);

export default RoleSelect;
