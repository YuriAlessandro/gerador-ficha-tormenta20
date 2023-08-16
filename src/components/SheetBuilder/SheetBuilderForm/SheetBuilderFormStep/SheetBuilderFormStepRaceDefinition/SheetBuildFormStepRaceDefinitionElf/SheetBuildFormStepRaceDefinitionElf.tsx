import { submitRace } from '@/store/slices/sheetBuilder/sheetBuilderSliceRaceDefinition';
import React from 'react';
import { Elf, RaceName } from 't20-sheet-builder';
import ConfirmButton from '../../../ConfirmButton';
import AttributesPreviewStatic from '../AtrributesPreviewStatic';
import { RaceComponentProps } from '../SheetBuilderFormStepRaceDefinition';

const SheetBuildFormStepRaceDefinitionElf: React.FC<RaceComponentProps> = ({
  confirmRace,
  attributesPreview,
}) => {
  const makeElf = () => new Elf();
  const createSubmitAction = () =>
    submitRace({
      name: RaceName.elf,
    });

  const confirmElf = () => {
    confirmRace(makeElf, createSubmitAction, 'isRaceReady');
  };

  return (
    <div>
      <p className='mb-6'>
        Elfos são seres feitos para a beleza e para a guerra, tão habilidosos
        com magia quanto com espadas e arcos. Elegantes, astutos, de vidas quase
        eternas, parecem superiores aos humanos em tudo.
      </p>
      <AttributesPreviewStatic attributesPreview={attributesPreview} />
      <ConfirmButton confirm={confirmElf} />
    </div>
  );
};

export default SheetBuildFormStepRaceDefinitionElf;
