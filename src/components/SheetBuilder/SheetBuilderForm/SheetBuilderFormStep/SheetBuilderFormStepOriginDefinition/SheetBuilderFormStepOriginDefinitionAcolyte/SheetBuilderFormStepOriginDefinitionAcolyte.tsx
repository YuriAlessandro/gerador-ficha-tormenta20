import {
  Acolyte,
  OriginBenefitFactoryAcolyte,
  SerializedOriginBenefitsAcolyte,
} from 't20-sheet-builder';
import React from 'react';
import ConfirmButton from '../../../ConfirmButton';
import { OriginComponentType } from '../SheetBuilderFormStepOriginDefinition';
import { submitOrigin } from '../../../../../../store/slices/sheetBuilder/sheetBuilderSliceOriginDefinition';

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
    confirmOrigin(makeAcolyte, createSubmitAction);
  };

  return (
    <div>
      {benefitsSelect}
      <ConfirmButton confirm={confirmAcolyte} />
    </div>
  );
};

export default SheetBuilderFormStepOriginDefinitionAcolyte;
