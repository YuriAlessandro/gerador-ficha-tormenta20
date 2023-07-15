import React from 'react';
import { RoleComponentProps } from '../SheetBuilderFormStepRoleDefinition';
import SheetBuilderFormRoleDefinitionArcanistConfirm from './SheetBuilderFormRoleDefinitionArcanistConfirm';
import { ArcanistFormContextProvider } from './SheetBuilderFormRoleDefinitionArcanistContext';
import SheetBuilderFormRoleDefinitionArcanistInitialSpells from './SheetBuilderFormRoleDefinitionArcanistInitialSpells';
import SheetBuilderFormRoleDefinitionArcanistPath from './SheetBuilderFormRoleDefinitionArcanistPath/SheetBuilderFormRoleDefinitionArcanistPath';
import SheetBuilderFormRoleDefinitionArcanistSkillSelect from './SheetBuilderFormRoleDefinitionArcanistSkillSelect';

const SheetBuilderFormRoleDefinitionArcanist: React.FC<RoleComponentProps> = ({
  confirmRole,
}) => (
  <ArcanistFormContextProvider>
    <div>
      <SheetBuilderFormRoleDefinitionArcanistSkillSelect />
      <SheetBuilderFormRoleDefinitionArcanistInitialSpells />
      <SheetBuilderFormRoleDefinitionArcanistPath />
      <SheetBuilderFormRoleDefinitionArcanistConfirm
        confirmRole={confirmRole}
      />
    </div>
  </ArcanistFormContextProvider>
);

export default SheetBuilderFormRoleDefinitionArcanist;
