import React from 'react';
import { Role } from 't20-sheet-builder/build/domain/entities/Role/Role';
import ConfirmButton from '@/components/SheetBuilder/SheetBuilderForm/ConfirmButton';
import { ConfirmFunction } from '@/components/SheetBuilder/SheetBuilderForm/useSheetBuilderSubmit';
import { useConfirmArcanist } from './useConfirmArcanist';

type Props = {
  confirmRole: ConfirmFunction<Role>;
};

const SheetBuilderFormRoleDefinitionArcanistConfirm = ({
  confirmRole,
}: Props) => {
  const { confirmArcanist } = useConfirmArcanist(confirmRole);
  return <ConfirmButton confirm={confirmArcanist} />;
};

export default SheetBuilderFormRoleDefinitionArcanistConfirm;
