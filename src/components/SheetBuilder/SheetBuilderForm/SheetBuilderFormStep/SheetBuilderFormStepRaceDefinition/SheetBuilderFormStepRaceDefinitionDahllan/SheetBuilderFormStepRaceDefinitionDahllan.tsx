import ConfirmButton from '@/components/SheetBuilder/SheetBuilderForm/ConfirmButton';
import { submitRace } from '@/store/slices/sheetBuilder/sheetBuilderSliceRaceDefinition';
import React from 'react';
import { Dahllan, RaceName } from 't20-sheet-builder';
import AttributesPreviewStatic from '../AtrributesPreviewStatic';
import { RaceComponentProps } from '../SheetBuilderFormStepRaceDefinition';

const SheetBuilderFormStepRaceDefinitionDahllan: React.FC<
  RaceComponentProps
> = ({ confirmRace, attributesPreview }) => {
  const makeDahllan = () => new Dahllan();
  const createSubmitAction = () =>
    submitRace({
      name: RaceName.dahllan,
    });

  const confirmDahllan = () => {
    confirmRace(makeDahllan, createSubmitAction, 'isRaceReady');
  };

  return (
    <div>
      <p className='mb-6'>
        Parte humanas, parte fadas, as dahllan são uma raça de mulheres com a
        seiva de árvores correndo nas veias. Falam com os animais, controlam as
        plantas — mas também são ferozes em batalha, retorcendo madeira para
        formar armaduras.
      </p>
      <AttributesPreviewStatic attributesPreview={attributesPreview} />
      <ConfirmButton confirm={confirmDahllan} />
    </div>
  );
};

export default SheetBuilderFormStepRaceDefinitionDahllan;
