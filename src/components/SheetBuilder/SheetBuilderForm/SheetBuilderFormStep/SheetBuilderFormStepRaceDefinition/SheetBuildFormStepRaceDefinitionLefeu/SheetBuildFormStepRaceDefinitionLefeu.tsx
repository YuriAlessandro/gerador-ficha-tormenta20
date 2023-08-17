import { submitRace } from '@/store/slices/sheetBuilder/sheetBuilderSliceRaceDefinition';
import React, { useCallback } from 'react';
import {
  Attribute,
  Attributes,
  Lefeu,
  Race,
  SkillName,
} from 't20-sheet-builder';
import { useDispatch } from 'react-redux';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import { SheetBuilderFormError } from '@/components/SheetBuilder/common/SheetBuilderFormError';
import ConfirmButton from '../../../ConfirmButton';
import { RaceComponentProps } from '../SheetBuilderFormStepRaceDefinition';
import SheetBuilderFormStepRaceDefinitionLefeuAttributeCheckboxes from './SheetBuilderFormStepRaceDefinitionLefeuAttributeCheckboxes';
import { AttributeCheckboxes } from '../SheetBuilderFormStepRaceDefinitionHuman/SheetBuilderFormStepRaceDefinitionHuman';
import SheetBuilderFormStepRaceDefinitionLefeuDeformities from './SheetBuilderFormStepRaceDefinitionLefeuDeformities';

const SheetBuildFormStepRaceDefinitionLefeu: React.FC<RaceComponentProps> = ({
  confirmRace,
  attributesPreview,
  setAttributeModifiers,
}) => {
  const [attributeCheckboxes, setAttributeCheckboxes] = React.useState<
    Readonly<AttributeCheckboxes>
  >({
    charisma: false,
    constitution: false,
    dexterity: false,
    intelligence: false,
    strength: false,
    wisdom: false,
  });
  const [deformities, setDeformities] = React.useState<SkillName[]>([]);

  const selectedAttributes = Object.entries(attributeCheckboxes)
    .filter(([_attribute, checked]) => checked)
    .map(([attribute]) => attribute as Attribute);

  const dispatch = useDispatch();
  const makeLefeu = () => {
    if (!deformities) {
      throw new SheetBuilderFormError('MISSING_DEFORMITIES_OPTION');
    }

    const lefeu = new Lefeu(selectedAttributes);
    lefeu.addDeformities(deformities);

    return lefeu;
  };
  const createSubmitAction = (race: Race) => {
    const lefeu = race as Lefeu;
    return submitRace(lefeu.serialize());
  };

  const confirmLefeu = () => {
    confirmRace(makeLefeu, createSubmitAction, 'isRaceReady');
  };

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
      <SheetBuilderFormStepRaceDefinitionLefeuDeformities
        setDeformitiesOption={setDeformities}
        deformities={deformities}
      />
      <ConfirmButton confirm={confirmLefeu} />
    </div>
  );
};

export default SheetBuildFormStepRaceDefinitionLefeu;
