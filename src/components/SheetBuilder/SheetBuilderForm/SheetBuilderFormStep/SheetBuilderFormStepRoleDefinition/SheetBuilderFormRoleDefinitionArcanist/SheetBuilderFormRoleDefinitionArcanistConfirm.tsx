import React from 'react';
import ConfirmButton from '@/components/SheetBuilder/SheetBuilderForm/ConfirmButton';
import { ConfirmFunction } from '@/components/SheetBuilder/SheetBuilderForm/useSheetBuilderSubmit';
import { Role } from 't20-sheet-builder/build/domain/entities/Role/Role';
import { useConfirmArcanist } from './useConfirmArcanist';

type Props = {
  confirmRole: ConfirmFunction<Role>;
};

const SheetBuilderFormRoleDefinitionArcanistConfirm = ({
  confirmRole,
}: Props) => {
  const { confirmArcanist } = useConfirmArcanist(confirmRole);
  const onConfirm = () => confirmArcanist();
  return <ConfirmButton confirm={onConfirm} />;
};

export default SheetBuilderFormRoleDefinitionArcanistConfirm;
