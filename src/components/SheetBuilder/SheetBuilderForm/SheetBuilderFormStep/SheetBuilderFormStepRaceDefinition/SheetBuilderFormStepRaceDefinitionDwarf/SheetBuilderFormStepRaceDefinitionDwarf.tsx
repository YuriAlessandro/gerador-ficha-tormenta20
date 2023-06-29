import React from 'react';
import { Dwarf, RaceName } from 't20-sheet-builder';
import { submitRace } from '@/store/slices/sheetBuilder/sheetBuilderSliceRaceDefinition';
import ConfirmButton from '@/components/SheetBuilder/SheetBuilderForm/ConfirmButton';
import { RaceComponentProps } from '../SheetBuilderFormStepRaceDefinition';
import AttributesPreviewStatic from '../AtrributesPreviewStatic';

const SheetBuilderFormStepRaceDefinitionDwarf: React.FC<RaceComponentProps> = ({
  confirmRace,
  attributesPreview,
}) => {
  const makeDwarf = () => new Dwarf();
  const createSubmitAction = (dwarf: Dwarf) =>
    submitRace({
      name: RaceName.dwarf,
      attributeModifiers: dwarf.attributeModifiers,
    });

  const confirmDwarf = () => {
    confirmRace(makeDwarf, createSubmitAction);
  };

  return (
    <div>
      <p className='mb-6'>Duro como pedra!</p>
      <AttributesPreviewStatic attributesPreview={attributesPreview} />
      <ConfirmButton confirm={confirmDwarf} />
    </div>
  );
};

export default SheetBuilderFormStepRaceDefinitionDwarf;
