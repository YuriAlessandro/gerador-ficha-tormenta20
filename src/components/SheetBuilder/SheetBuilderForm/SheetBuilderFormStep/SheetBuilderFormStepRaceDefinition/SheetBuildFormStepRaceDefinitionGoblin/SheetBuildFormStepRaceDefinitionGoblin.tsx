import React from 'react';
import { Goblin, RaceName } from 't20-sheet-builder';
import ConfirmButton from '../../../ConfirmButton';
import { RaceComponentProps } from '../SheetBuilderFormStepRaceDefinition';
import AttributesPreviewStatic from '../AtrributesPreviewStatic';

const SheetBuildFormStepRaceDefinitionGoblin: React.FC<RaceComponentProps> = ({
  confirmRace,
  attributesPreview,
}) => {
  const makeDwarf = () => new Goblin();
  const createSubmitAction = () =>
    submitRace({
      name: RaceName.goblin,
    });

  const confirmDwarf = () => {
    confirmRace(makeDwarf, createSubmitAction);
  };

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
