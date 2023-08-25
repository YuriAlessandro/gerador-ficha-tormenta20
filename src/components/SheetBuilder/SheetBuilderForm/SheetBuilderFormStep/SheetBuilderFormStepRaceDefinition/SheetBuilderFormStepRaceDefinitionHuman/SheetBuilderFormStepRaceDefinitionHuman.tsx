import ConfirmButton from '@/components/SheetBuilder/SheetBuilderForm/ConfirmButton';
import { SheetBuilderFormError } from '@/components/SheetBuilder/common/SheetBuilderFormError';
import {
  selectSheetBuilderRace,
  submitRace,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceRaceDefinition';
import { PayloadAction } from '@reduxjs/toolkit';
import React, { useCallback, useEffect } from 'react';
import {
  Attribute,
  Attributes,
  GeneralPowerName,
  Human,
  Race,
  SerializedHuman,
  SerializedRace,
  SkillName,
  VersatileChoiceFactory,
  VersatileChoiceType,
} from 't20-sheet-builder';
import { useDispatch, useSelector } from 'react-redux';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import { RaceComponentProps } from '../SheetBuilderFormStepRaceDefinition';
import SheetBuilderFormStepRaceDefinitionHumanAttributeCheckboxes from './SheetBuilderFormStepRaceDefinitionHumanAttributeCheckboxes';
import SheetBuilderFormStepRaceDefinitionHumanVersatile from './SheetBuilderFormStepRaceDefinitionHumanVersatile';

export type AttributeCheckboxes = Record<Attribute, boolean>;
const SheetBuilderFormStepRaceDefinitionHuman: React.FC<RaceComponentProps> = ({
  attributesPreview,
  setAttributeModifiers,
  confirmRace,
}) => {
  const { versatileChoices } = useSelector(
    selectSheetBuilderRace
  ) as SerializedHuman;

  const [storedFirstOption, storedSecondOption] = versatileChoices;

  const dispatch = useDispatch();
  const [firstVersatileOption, setFirstVersatileOption] = React.useState<
    SkillName | undefined
  >(storedFirstOption.name as SkillName);
  const [secondVersatileOption, setSecondVersatileOption] = React.useState<
    GeneralPowerName | SkillName | undefined
  >(storedSecondOption.name);
  const [secondVersatileOptionType, setSecondVersatileOptionType] =
    React.useState<VersatileChoiceType | undefined>(storedSecondOption.type);
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

  useEffect(() => {
    if (storedFirstOption) {
      setFirstVersatileOption(storedFirstOption.name as SkillName);
    }
  }, [storedFirstOption.name]);

  useEffect(() => {
    if (storedSecondOption) {
      setSecondVersatileOption(storedSecondOption.name);
    }
  }, [storedSecondOption.name]);

  useEffect(() => {
    if (storedSecondOption) {
      setSecondVersatileOptionType(storedSecondOption.type);
    }
  }, [storedSecondOption.type]);

  const selectedAttributes = Object.entries(attributeCheckboxes)
    .filter(([_attribute, checked]) => checked)
    .map(([attribute]) => attribute as Attribute);

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

  const makeHuman = () => {
    if (!firstVersatileOption) {
      throw new SheetBuilderFormError('MISSING_VERSATILE_FIRST_OPTION');
    }

    if (!secondVersatileOptionType) {
      throw new SheetBuilderFormError('MISSING_VERSATILE_SECOND_OPTION_TYPE');
    }

    if (!secondVersatileOption) {
      throw new SheetBuilderFormError('MISSING_VERSATILE_SECOND_OPTION');
    }

    const firstOption = VersatileChoiceFactory.make(
      'skill',
      firstVersatileOption
    );
    const secondOption = VersatileChoiceFactory.make(
      secondVersatileOptionType,
      secondVersatileOption
    );

    return new Human(selectedAttributes, [firstOption, secondOption]) as Race;
  };

  const createSubmitAction = (race: Race) => {
    const human = race as Human;
    return submitRace(human.serialize());
  };

  return (
    <div>
      <SheetBuilderFormStepRaceDefinitionHumanAttributeCheckboxes
        attributesPreview={attributesPreview}
        toggleAttribute={toggleAttribute}
      />
      <SheetBuilderFormStepRaceDefinitionHumanVersatile
        firstVersatileOption={firstVersatileOption}
        secondVersatileOption={secondVersatileOption}
        secondVersatileOptionType={secondVersatileOptionType}
        setFirstVersatileOption={setFirstVersatileOption}
        setSecondVersatileOption={setSecondVersatileOption}
        setSecondVersatileOptionType={setSecondVersatileOptionType}
      />
      <ConfirmButton
        confirm={() => {
          dispatch(setOptionReady({ key: 'isRaceReady', value: 'confirmed' }));
          confirmRace<Race, SerializedRace, PayloadAction<SerializedRace>>(
            makeHuman,
            createSubmitAction,
            'isRaceReady'
          );
        }}
      />
    </div>
  );
};

export default SheetBuilderFormStepRaceDefinitionHuman;
