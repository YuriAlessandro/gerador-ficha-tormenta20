import React, { useEffect } from 'react';
import { ArcanistPathName, SerializedArcanist } from 't20-sheet-builder';
import { selectBuilderRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import { useSelector } from 'react-redux';
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

  const storedArcanist = useSelector(selectBuilderRole) as
    | SerializedArcanist
    | undefined;

  useEffect(() => {
    if (storedArcanist) selectPath(storedArcanist.path.name);
  }, [storedArcanist]);

  return (
    <div>
      <h3>Caminho do arcanista</h3>
      <ArcanistPathSelect setPath={selectPath} path={path} />
      {PathComponent && <PathComponent />}
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionArcanistPath;
