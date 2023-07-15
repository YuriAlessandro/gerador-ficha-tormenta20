import {
  Arcanist,
  ArcanistFactory,
  ArcanistSerializer,
} from 't20-sheet-builder';
import { Role } from 't20-sheet-builder/build/domain/entities/Role/Role';
import { ConfirmFunction } from '@/components/SheetBuilder/SheetBuilderForm/useSheetBuilderSubmit';
import { submitRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import { useArcanistFormContext } from './SheetBuilderFormRoleDefinitionArcanistContext';

export const useConfirmArcanist = (confirmRole: ConfirmFunction<Role>) => {
  const context = useArcanistFormContext();

  const makeArcanist = (): Arcanist => {
    console.log('context', context);
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