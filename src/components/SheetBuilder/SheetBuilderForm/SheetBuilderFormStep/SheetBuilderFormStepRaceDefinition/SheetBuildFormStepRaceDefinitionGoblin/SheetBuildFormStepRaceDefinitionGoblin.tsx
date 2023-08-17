import { submitRace } from '@/store/slices/sheetBuilder/sheetBuilderSliceRaceDefinition';
import React from 'react';
import { Goblin, Race, SerializedRace } from 't20-sheet-builder';
import ConfirmButton from '../../../ConfirmButton';
import AttributesPreviewStatic from '../AtrributesPreviewStatic';
import { RaceComponentProps } from '../SheetBuilderFormStepRaceDefinition';

const SheetBuildFormStepRaceDefinitionGoblin: React.FC<RaceComponentProps> = ({
  confirmRace,
  attributesPreview,
}) => {
  const makeDwarf = () => new Goblin();
  const createSubmitAction = (race: Race) => {
    const goblin = race as Goblin;
    return submitRace(goblin.serialize() as SerializedRace);
  };

  const confirmDwarf = () =>
    confirmRace(makeDwarf, createSubmitAction, 'isRaceReady');

  return (
    <div>
      <p className='mb-6'>
        Pequenos seres feiosos prosperando em carreiras que quase ninguém
        tentaria: espiões, aeronautas, engenhoqueiros. Onde o anão teimoso e o
        elfo empolado falham, o goblin pode dar um jeito. Porque ele não tem
        vergonha. Nem orgulho. Nem bom senso.{' '}
      </p>
      <AttributesPreviewStatic attributesPreview={attributesPreview} />
      <ConfirmButton confirm={confirmDwarf} />
    </div>
  );
};

export default SheetBuildFormStepRaceDefinitionGoblin;
