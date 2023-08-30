import { ConfirmFunction } from '@/components/SheetBuilder/SheetBuilderForm/useSheetBuilderSubmit';
import { submitRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import { Arcanist, ArcanistFactory } from 't20-sheet-builder';
import { Role } from 't20-sheet-builder/build/domain/entities/Role/Role';
import { useArcanistFormContext } from './SheetBuilderFormRoleDefinitionArcanistContext';

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

  const createSubmitAction = (arcanist: Arcanist) =>
    submitRole(arcanist.serialize());

  const confirmArcanist = () => {
    confirmRole(makeArcanist, createSubmitAction, 'isRoleReady');
  };

  return {
    confirmArcanist,
  };
};
