import { submitRace } from '@/store/slices/sheetBuilder/sheetBuilderSliceRaceDefinition';
import React from 'react';
import {
  Qareen,
  QareenType,
  Race,
  SerializedRace,
  SpellName,
} from 't20-sheet-builder';
import { SheetBuilderFormError } from '@/components/SheetBuilder/common/SheetBuilderFormError';
import ConfirmButton from '../../../ConfirmButton';
import AttributesPreviewStatic from '../AtrributesPreviewStatic';
import { RaceComponentProps } from '../SheetBuilderFormStepRaceDefinition';
import SheetBuildFormStepRaceDefinitionQareenSpell from './SheetBuildFormStepRaceDefinitionQareenSpell';
import SheetBuildFormStepRaceDefinitionQareenType from './SheetBuildFormStepRaceDefinitionQareenType';

const SheetBuildFormStepRaceDefinitionQareen: React.FC<RaceComponentProps> = ({
  confirmRace,
  attributesPreview,
}) => {
  const [qareenType, setQareenType] = React.useState<QareenType>('air');
  const [spell, setSpell] = React.useState<SpellName | ''>('');

  const makeQareen = () => {
    if (!spell) throw new SheetBuilderFormError('MISSING_QAREEN_SPELL');
    return new Qareen(qareenType, spell);
  };
  const createSubmitAction = (race: Race) => {
    const qareen = race as Qareen;
    return submitRace(qareen.serialize() as SerializedRace);
  };

  const confirmQareen = () => {
    confirmRace(makeQareen, createSubmitAction, 'isRaceReady');
  };

  return (
    <div>
      <p className='mb-6'>
        Descendentes de poderosos gênios, os qareen são otimistas, generosos e
        prestativos, sempre ansiosos por ajudar.
      </p>
      <AttributesPreviewStatic attributesPreview={attributesPreview} />
      <SheetBuildFormStepRaceDefinitionQareenType setType={setQareenType} />
      <SheetBuildFormStepRaceDefinitionQareenSpell setSpell={setSpell} />
      <ConfirmButton confirm={confirmQareen} />
    </div>
  );
};

export default SheetBuildFormStepRaceDefinitionQareen;
