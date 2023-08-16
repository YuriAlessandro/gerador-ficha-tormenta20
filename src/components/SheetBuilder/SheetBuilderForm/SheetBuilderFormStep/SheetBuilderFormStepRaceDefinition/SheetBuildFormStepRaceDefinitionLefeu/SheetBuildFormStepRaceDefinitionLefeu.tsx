import { submitRace } from '@/store/slices/sheetBuilder/sheetBuilderSliceRaceDefinition';
import React, { useCallback } from 'react';
import { Attribute, Attributes, Lefeu, RaceName } from 't20-sheet-builder';
import { useDispatch } from 'react-redux';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import ConfirmButton from '../../../ConfirmButton';
import { RaceComponentProps } from '../SheetBuilderFormStepRaceDefinition';
import SheetBuilderFormStepRaceDefinitionLefeuAttributeCheckboxes from './SheetBuilderFormStepRaceDefinitionLefeuAttributeCheckboxes';
import { AttributeCheckboxes } from '../SheetBuilderFormStepRaceDefinitionHuman/SheetBuilderFormStepRaceDefinitionHuman';

const SheetBuildFormStepRaceDefinitionLefeu: React.FC<RaceComponentProps> = ({
  confirmRace,
  attributesPreview,
  setAttributeModifiers,
}) => {
  const dispatch = useDispatch();
  const makeLefeu = () => new Lefeu();
  const createSubmitAction = () =>
    submitRace({
      name: RaceName.lefeu,
    });

  const confirmMinotaur = () => {
    confirmRace(makeLefeu, createSubmitAction, 'isRaceReady');
  };

  const [attributeCheckboxes, setAttributeCheckboxes] = React.useState<
    Readonly<AttributeCheckboxes>
  >({
    charisma: true,
    constitution: false,
    dexterity: false,
    intelligence: false,
    strength: false,
    wisdom: false,
  });

  const toggleAttribute = useCallback(
    (attribute: Attribute) => {
      dispatch(setOptionReady({ key: 'isRaceReady', value: 'pending' }));
      const updated = {
        ...attributeCheckboxes,
        [attribute]: !attributeCheckboxes[attribute],
      };
      const attributeModifiers = Object.entries(updated).reduce<
        Partial<Attributes>
      >((acc, [key, checked]) => {
        if (checked) {
          acc[key as Attribute] = 1;
        }
        return acc;
      }, {});
      setAttributeCheckboxes(updated);
      setAttributeModifiers(attributeModifiers);
    },
    [setAttributeModifiers, attributeCheckboxes]
  );

  return (
    <div>
      <p className='mb-6'>
        Com a influência macabra da Tormenta permeando cada vez mais o mundo,
        surgiram o
      </p>
      <SheetBuilderFormStepRaceDefinitionLefeuAttributeCheckboxes
        attributesPreview={attributesPreview}
        toggleAttribute={toggleAttribute}
      />
      <ConfirmButton confirm={confirmMinotaur} />
    </div>
  );
};

export default SheetBuildFormStepRaceDefinitionLefeu;
