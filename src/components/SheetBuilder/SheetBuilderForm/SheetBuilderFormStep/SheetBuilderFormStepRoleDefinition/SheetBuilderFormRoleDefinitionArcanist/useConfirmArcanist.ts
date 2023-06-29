import {
  Arcanist,
  ArcanistFactory,
  ArcanistSerializer,
} from 't20-sheet-builder';
import { Role } from 't20-sheet-builder/build/domain/entities/Role/Role';
import { ConfirmFunction } from '../../../useSheetBuilderSubmit';
import { useArcanistFormContext } from './SheetBuilderFormRoleDefinitionArcanistContext';
import { submitRole } from '../../../../../../store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';

export const useConfirmArcanist = (confirmRole: ConfirmFunction<Role>) => {
  const context = useArcanistFormContext();

  const makeArcanist = (): Arcanist => {
    if (!context.path) throw new Error('MISSING_ARCANIST_PATH');
    const arcanist = ArcanistFactory.makeFromParams({
      ...context,
      chosenSkills: context.skillsByGroup.flat(),
      path: context.path,
    });
    return arcanist;
  };

  const createSubmitAction = (arcanist: Arcanist) => {
    const serializer = new ArcanistSerializer(arcanist);
    const serialized = serializer.serialize();
    return submitRole(serialized);
  };

  const confirmArcanist = () => {
    confirmRole(makeArcanist, createSubmitAction);
  };

  return {
    confirmArcanist,
  };
};
