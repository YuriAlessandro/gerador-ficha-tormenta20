import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetFormAlert } from '@/store/slices/sheetBuilder/sheetBuilderSliceForm';
import { selectAttributes } from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import { resetRace } from '@/store/slices/sheetBuilder/sheetBuilderSliceRaceDefinition';
import React, { useMemo } from 'react';
import {
  Attribute,
  Attributes,
  Race,
  RaceName,
  Races,
} from 't20-sheet-builder';
import {
  ConfirmFunction,
  useSheetBuilderConfirm,
} from '../../useSheetBuilderSubmit';
import { AttributePreview } from './AttributePreview';
import RacesSelect from './RacesSelect';
import SheetBuilderFormStepRaceDefinitionDahllan from './SheetBuilderFormStepRaceDefinitionDahllan/SheetBuilderFormStepRaceDefinitionDahllan';
import SheetBuilderFormStepRaceDefinitionDwarf from './SheetBuilderFormStepRaceDefinitionDwarf/SheetBuilderFormStepRaceDefinitionDwarf';
import SheetBuilderFormStepRaceDefinitionHuman from './SheetBuilderFormStepRaceDefinitionHuman/SheetBuilderFormStepRaceDefinitionHuman';
import SheetBuildFormStepRaceDefinitionElf from './SheetBuildFormStepRaceDefinitionElf/SheetBuildFormStepRaceDefinitionElf';
import SheetBuildFormStepRaceDefinitionGoblin from './SheetBuildFormStepRaceDefinitionGoblin/SheetBuildFormStepRaceDefinitionGoblin';

export type RaceComponentProps = {
  attributesPreview: AttributePreview[];
  confirmRace: ConfirmFunction<Race>;
  setAttributeModifiers: (attributeModifiers: Partial<Attributes>) => void;
};

const raceComponents: Record<RaceName, React.FC<RaceComponentProps>> = {
  [RaceName.dwarf]: SheetBuilderFormStepRaceDefinitionDwarf,
  [RaceName.human]: SheetBuilderFormStepRaceDefinitionHuman,
  [RaceName.dahllan]: SheetBuilderFormStepRaceDefinitionDahllan,
  [RaceName.elf]: SheetBuildFormStepRaceDefinitionElf,
  [RaceName.goblin]: SheetBuildFormStepRaceDefinitionGoblin,
};

const SheetBuilderFormStepRaceDefinition = () => {
  const [race, setRace] = React.useState<RaceName>();
  const [attributeModifiers, setAttributeModifiers] = React.useState<
    Partial<Attributes>
  >({});
  const { confirm } = useSheetBuilderConfirm<Race>();
  const dispatch = useAppDispatch();
  const attributes = useAppSelector(selectAttributes);

  const attributesPreview = useMemo(
    () =>
      Object.entries(attributes).map<AttributePreview>(([key, value]) => {
        const attribute = key as Attribute;
        const modifier = attributeModifiers[attribute];
        return {
          attribute,
          modifier,
          value: value + (modifier ?? 0),
        };
      }),
    [attributes, attributeModifiers]
  );

  const resetState = () => {
    dispatch(resetFormAlert());
    dispatch(resetRace());
    setAttributeModifiers({});
  };

  const changeRace = (selectedRace?: RaceName) => {
    setRace(selectedRace);
    resetState();

    if (selectedRace) {
      const RaceClass = Races.getByName(selectedRace);
      setAttributeModifiers(RaceClass.attributeModifiers);
    }
  };
  const RaceComponent = race ? raceComponents[race] : null;
  return (
    <section className='py-6'>
      <RacesSelect changeRace={changeRace} />
      {RaceComponent && (
        <RaceComponent
          setAttributeModifiers={setAttributeModifiers}
          confirmRace={confirm}
          attributesPreview={attributesPreview}
        />
      )}
    </section>
  );
};

export default SheetBuilderFormStepRaceDefinition;
