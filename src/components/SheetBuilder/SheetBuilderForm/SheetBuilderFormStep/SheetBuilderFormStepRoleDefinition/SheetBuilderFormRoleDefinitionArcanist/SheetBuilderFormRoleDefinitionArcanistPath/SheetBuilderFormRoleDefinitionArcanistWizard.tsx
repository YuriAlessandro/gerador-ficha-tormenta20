import React from 'react';
import {
  ArcanisPathWizardFocusName,
  ArcanistPathWizardFocuses,
  Translator,
} from 't20-sheet-builder';
import SheetBuilderFormSelect from '../../../../SheetBuilderFormSelect';
import { useArcanistFormContext } from '../SheetBuilderFormRoleDefinitionArcanistContext';

const SheetBuilderFormRoleDefinitionArcanistWizard = () => {
  const { setWizardFocus } = useArcanistFormContext();
  return (
    <div>
      <p>Você lança magias através de uma foco</p>
      <SheetBuilderFormSelect
        options={ArcanistPathWizardFocuses.getAll().map((focus) => ({
          value: focus.equipmentName as ArcanisPathWizardFocusName,
          label: Translator.getEquipmentTranslation(focus.equipmentName),
        }))}
        onChange={(option) => setWizardFocus(option?.value)}
        className='mb-3'
        placeholder='Escolha um foco'
        id='arcanist-wizard-focus-select'
      />
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionArcanistWizard;
