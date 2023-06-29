import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SheetBuilderFormAlertError from './SheetBuilderFormAlertError';
import SheetBuilderFormAlertSuccess from './SheetBuilderFormAlertSuccess';
import SheetBuilderFormStepAttributesDefinition from './SheetBuilderFormStep/SheetBuilderFormStepAttributesDefinition/SheetBuilderFormStepAttributesDefinition';
import SheetBuilderFormStepEquipmentDefinition from './SheetBuilderFormStep/SheetBuilderFormStepEquipmentDefinition/SheetBuilderFormStepEquipmentDefinition';
import SheetBuilderFormStepIntelligenceSkillsTraining from './SheetBuilderFormStep/SheetBuilderFormStepIntelligenceSkillsTraining/SheetBuilderFormStepIntelligenceSkillsTraining';
import SheetBuilderFormStepOriginDefinition from './SheetBuilderFormStep/SheetBuilderFormStepOriginDefinition/SheetBuilderFormStepOriginDefinition';
import SheetBuilderFormStepRaceDefinition from './SheetBuilderFormStep/SheetBuilderFormStepRaceDefinition/SheetBuilderFormStepRaceDefinition';
import SheetBuilderFormStepRoleDefinition from './SheetBuilderFormStep/SheetBuilderFormStepRoleDefinition/SheetBuilderFormStepRoleDefinition';
import {
  selectFormAlert,
  resetFormAlert,
} from '../../../store/slices/sheetBuilder/sheetBuilderSliceForm';

const SheetBuilderForm = () => {
  const alert = useSelector(selectFormAlert);
  const dispatch = useDispatch();

  return (
    <div className='py-2'>
      <SheetBuilderFormStepAttributesDefinition />
      <SheetBuilderFormStepRaceDefinition />
      <SheetBuilderFormStepRoleDefinition />
      <SheetBuilderFormStepOriginDefinition />
      <SheetBuilderFormStepIntelligenceSkillsTraining />
      <SheetBuilderFormStepEquipmentDefinition />

      <div className='container mx-auto'>
        {alert?.type === 'error' && (
          <SheetBuilderFormAlertError message={alert.message} />
        )}
        {alert?.type === 'success' && (
          <SheetBuilderFormAlertSuccess message={alert.message} />
        )}
      </div>
    </div>
  );
};

export default SheetBuilderForm;
