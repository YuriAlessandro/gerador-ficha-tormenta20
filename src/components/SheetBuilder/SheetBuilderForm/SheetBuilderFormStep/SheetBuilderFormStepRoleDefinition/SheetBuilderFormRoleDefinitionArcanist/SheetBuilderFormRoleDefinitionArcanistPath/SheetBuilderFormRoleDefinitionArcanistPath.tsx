import React from 'react';
import { ArcanistPathName } from 't20-sheet-builder';
import ArcanistPathSelect from '../ArcanistPathSelect';
import SheetBuilderFormRoleDefinitionArcanistMage from './SheetBuilderFormRoleDefinitionArcanistMage';
import SheetBuilderFormRoleDefinitionArcanistSorcerer from './SheetBuilderFormRoleDefinitionArcanistSorcerer';
import SheetBuilderFormRoleDefinitionArcanistWizard from './SheetBuilderFormRoleDefinitionArcanistWizard';
import { useArcanistFormContext } from '../SheetBuilderFormRoleDefinitionArcanistContext';

const pathComponents: Record<ArcanistPathName, React.FC> = {
  mage: SheetBuilderFormRoleDefinitionArcanistMage,
  sorcerer: SheetBuilderFormRoleDefinitionArcanistSorcerer,
  wizard: SheetBuilderFormRoleDefinitionArcanistWizard,
};

const SheetBuilderFormRoleDefinitionArcanistPath = () => {
  const { path, selectPath } = useArcanistFormContext();

  const PathComponent = path ? pathComponents[path] : null;
  return (
    <div>
      <h3>Caminho do arcanista</h3>
      <ArcanistPathSelect setPath={selectPath} />
      {PathComponent && <PathComponent />}
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionArcanistPath;
