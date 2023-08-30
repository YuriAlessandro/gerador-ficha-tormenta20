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
  const selectedQareen = useSelector(selectSheetBuilderRace) as
    | SerializedQareen
    | undefined;

  const { mysticTattooSpell: storedSpell, qareenType: storedType } =
    selectedQareen ?? {
      mysticTattooSpell: undefined,
      qareenType: undefined,
    };
  const [qareenType, setQareenType] = React.useState<QareenType | undefined>(
    storedType
  );
  const [spell, setSpell] = React.useState<SpellName | undefined>(storedSpell);

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
    if (!qareenType) throw new SheetBuilderFormError('MISSING_QAREEN_TYPE');
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
