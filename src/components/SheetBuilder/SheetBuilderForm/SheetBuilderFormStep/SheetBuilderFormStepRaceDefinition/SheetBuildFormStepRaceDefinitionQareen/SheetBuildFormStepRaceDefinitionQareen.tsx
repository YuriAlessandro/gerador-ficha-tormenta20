import {
  selectSheetBuilderRace,
  submitRace,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceRaceDefinition';
import React, { useEffect } from 'react';
import {
  Qareen,
  QareenType,
  Race,
  SerializedQareen,
  SerializedRace,
  SpellName,
} from 't20-sheet-builder';
import { SheetBuilderFormError } from '@/components/SheetBuilder/common/SheetBuilderFormError';
import { useSelector } from 'react-redux';
import ConfirmButton from '../../../ConfirmButton';
import AttributesPreviewStatic from '../AtrributesPreviewStatic';
import { RaceComponentProps } from '../SheetBuilderFormStepRaceDefinition';
import SheetBuildFormStepRaceDefinitionQareenSpell from './SheetBuildFormStepRaceDefinitionQareenSpell';
import SheetBuildFormStepRaceDefinitionQareenType from './SheetBuildFormStepRaceDefinitionQareenType';

const SheetBuildFormStepRaceDefinitionQareen: React.FC<RaceComponentProps> = ({
  confirmRace,
  attributesPreview,
}) => {
  const { mysticTattooSpell: storedSpell, qareenType: storedType } =
    useSelector(selectSheetBuilderRace) as SerializedQareen;
  const [qareenType, setQareenType] = React.useState<QareenType>(storedType);
  const [spell, setSpell] = React.useState<SpellName>(storedSpell);

  useEffect(() => {
    if (storedType) {
      setQareenType(storedType);
    }
  }, [storedType]);

  useEffect(() => {
    if (storedSpell) {
      setSpell(storedSpell);
    }
  }, [storedSpell]);

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
      <SheetBuildFormStepRaceDefinitionQareenType
        setType={setQareenType}
        type={qareenType}
      />
      <SheetBuildFormStepRaceDefinitionQareenSpell
        setSpell={setSpell}
        spell={spell}
      />
      <ConfirmButton confirm={confirmQareen} />
    </div>
  );
};

export default SheetBuildFormStepRaceDefinitionQareen;
