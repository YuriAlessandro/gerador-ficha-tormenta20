import React, { useEffect } from 'react';
import {
  GeneralPowerName,
  Origin,
  OriginName,
  OriginPowerName,
  Origins,
  SkillName,
} from 't20-sheet-builder';
import { useSelector } from 'react-redux';
import { selectSheetOrigin } from '@/store/slices/sheetBuilder/sheetBuilderSliceOriginDefinition';
import {
  ConfirmFunction,
  useSheetBuilderConfirm,
} from '../../useSheetBuilderSubmit';
import OriginBenefitsSelect, {
  OriginBenefitOption,
} from './OriginBenefitsSelect';
import OriginEquipments from './OriginEquipments';
import OriginSelect from './OriginSelect';
import SheetBuilderFormStepOriginDefinitionAcolyte from './SheetBuilderFormStepOriginDefinitionAcolyte/SheetBuilderFormStepOriginDefinitionAcolyte';
import SheetBuilderFormStepOriginDefinitionAnimalsFriend from './SheetBuilderFormStepOriginDefinitionAnimalsFriend/SheetBuilderFormStepOriginDefinitionAnimalsFriend';

export type OriginBenefitName = OriginPowerName | SkillName | GeneralPowerName;

export type OriginComponentType = React.FC<{
  selectedBenefits: OriginBenefitOption[];
  benefitsSelect: JSX.Element;
  confirmOrigin: ConfirmFunction<Origin>;
}>;

const originComponents: Record<OriginName, OriginComponentType> = {
  [OriginName.acolyte]: SheetBuilderFormStepOriginDefinitionAcolyte,
  [OriginName.animalsFriend]: SheetBuilderFormStepOriginDefinitionAnimalsFriend,
};

const SheetBuilderFormStepOriginDefinition = () => {
  const storedOrigin = useSelector(selectSheetOrigin);
  const { confirm } = useSheetBuilderConfirm<Origin>();
  const [origin, setOrigin] = React.useState<OriginName>();
  const [selectedBenefits, setSelectedBenefits] = React.useState<
    OriginBenefitOption[]
  >([]);

  const OriginComponent = origin ? originComponents[origin] : null;
  const OriginClass = origin ? Origins.getByName(origin) : null;
  const originEquipments = OriginClass ? OriginClass.equipments : null;
  const originBenefits = OriginClass
    ? {
        generalPowers: OriginClass.generalPowers,
        skills: OriginClass.skills,
        originPower: OriginClass.originPower,
      }
    : null;

  useEffect(() => {
    if (storedOrigin) {
      const currentStoredBenefits = storedOrigin.origin?.chosenBenefits.map(
        (benefit) => ({
          name: benefit.name,
          type: benefit.type,
        })
      );
      setOrigin(storedOrigin.origin?.name);
      if (currentStoredBenefits) setSelectedBenefits(currentStoredBenefits);
    }
  }, [storedOrigin]);

  return (
    <div>
      <OriginSelect setOrigin={setOrigin} origin={origin} />
      {originEquipments && <OriginEquipments equipments={originEquipments} />}
      {OriginComponent && originBenefits && (
        <OriginComponent
          selectedBenefits={selectedBenefits}
          confirmOrigin={confirm}
          benefitsSelect={
            <OriginBenefitsSelect
              benefits={originBenefits}
              setBenefits={setSelectedBenefits}
              selectedBenefits={selectedBenefits}
            />
          }
        />
      )}
    </div>
  );
};

export default SheetBuilderFormStepOriginDefinition;
