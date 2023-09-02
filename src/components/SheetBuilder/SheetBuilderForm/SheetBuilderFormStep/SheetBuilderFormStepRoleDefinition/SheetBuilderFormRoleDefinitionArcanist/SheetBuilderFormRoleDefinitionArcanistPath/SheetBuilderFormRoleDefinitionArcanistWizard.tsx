import React, { useEffect } from 'react';
import {
  ArcanisPathWizardFocusName,
  ArcanistPathWizardFocuses,
  SerializedArcanist,
  SerializedArcanistWizard,
  Translator,
} from 't20-sheet-builder';
import SheetBuilderFormSelect from '@/components/SheetBuilder/SheetBuilderForm/SheetBuilderFormSelect';
import { useSelector } from 'react-redux';
import { selectBuilderRole } from '@/store/slices/sheetBuilder/sheetBuilderSliceRoleDefinition';
import { useArcanistFormContext } from '../SheetBuilderFormRoleDefinitionArcanistContext';

const SheetBuilderFormRoleDefinitionArcanistWizard = () => {
  const storedArcanist = useSelector(selectBuilderRole) as
    | SerializedArcanist<SerializedArcanistWizard>
    | undefined;
  const { wizardFocus, setWizardFocus } = useArcanistFormContext();

  useEffect(() => {
    if (storedArcanist) setWizardFocus(storedArcanist.path.focus);
  }, [storedArcanist]);

  const options = ArcanistPathWizardFocuses.getAll().map((focus) => ({
    value: focus.equipmentName as ArcanisPathWizardFocusName,
    label: Translator.getEquipmentTranslation(focus.equipmentName),
  }));

  return (
    <div>
      <p>Você lança magias através de uma foco</p>
      <SheetBuilderFormSelect
        options={options}
        value={options.find((option) => option.value === wizardFocus)}
        onChange={(option) => setWizardFocus(option?.value)}
        className='mb-3'
        placeholder='Escolha um foco'
        id='arcanist-wizard-focus-select'
      />
    </div>
  );
};

export default SheetBuilderFormRoleDefinitionArcanistWizard;
