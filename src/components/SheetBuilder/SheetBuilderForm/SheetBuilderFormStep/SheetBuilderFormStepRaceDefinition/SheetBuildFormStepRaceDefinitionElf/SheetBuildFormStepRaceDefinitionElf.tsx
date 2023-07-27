import React from 'react';
import { Elf, RaceName } from 't20-sheet-builder';
import { submitRace } from '@/store/slices/sheetBuilder/sheetBuilderSliceRaceDefinition';
import { RaceComponentProps } from '../SheetBuilderFormStepRaceDefinition';
import ConfirmButton from '../../../ConfirmButton';
import AttributesPreviewStatic from '../AtrributesPreviewStatic';

const SheetBuildFormStepRaceDefinitionElf: React.FC<RaceComponentProps> = ({
  confirmRace,
  attributesPreview,
}) => {
  const makeDwarf = () => new Elf();
  const createSubmitAction = () =>
    submitRace({
      name: RaceName.elf,
    });

  const confirmDwarf = () => {
    confirmRace(makeDwarf, createSubmitAction);
  };

  return (
    <div>
      <p className='mb-6'>
        Elfos são seres feitos para a beleza e para a guerra, tão habilidosos
        com magia quanto com espadas e arcos. Elegantes, astutos, de vidas quase
        eternas, parecem superiores aos humanos em tudo.
      </p>
      <AttributesPreviewStatic attributesPreview={attributesPreview} />
      <ConfirmButton confirm={confirmDwarf} />
    </div>
  );
};

export default SheetBuildFormStepRaceDefinitionElf;
