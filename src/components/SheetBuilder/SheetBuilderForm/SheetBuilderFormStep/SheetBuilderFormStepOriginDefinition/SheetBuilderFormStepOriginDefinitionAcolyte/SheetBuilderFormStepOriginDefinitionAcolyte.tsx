import {
  Acolyte,
  OriginBenefitFactoryAcolyte,
  SerializedOriginBenefitsAcolyte,
} from 't20-sheet-builder';
import React from 'react';
import { submitOrigin } from '@/store/slices/sheetBuilder/sheetBuilderSliceOriginDefinition';
import ConfirmButton from '@/components/SheetBuilder/SheetBuilderForm/ConfirmButton';
import { OriginComponentType } from '../SheetBuilderFormStepOriginDefinition';

const SheetBuilderFormStepOriginDefinitionAcolyte: OriginComponentType = ({
  benefitsSelect,
  confirmOrigin,
  selectedBenefits,
}) => {
  const makeAcolyte = () => {
    const benefitFactory = new OriginBenefitFactoryAcolyte();
    const benefits = selectedBenefits.map((benefit) =>
      benefitFactory.makeFromSerialized(
        benefit as SerializedOriginBenefitsAcolyte
      )
    );

    return new Acolyte(benefits);
  };

  const createSubmitAction = (acolyte: Acolyte) =>
    submitOrigin(acolyte.serialize());

  const confirmAcolyte = () => {
    confirmOrigin(makeAcolyte, createSubmitAction, 'isOriginReady');
  };

  return (
    <div>
      {benefitsSelect}
      <ConfirmButton confirm={confirmAcolyte} />
    </div>
  );
};

export default SheetBuilderFormStepOriginDefinitionAcolyte;
