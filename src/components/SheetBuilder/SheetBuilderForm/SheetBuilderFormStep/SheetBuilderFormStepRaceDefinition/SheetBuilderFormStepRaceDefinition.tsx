import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetFormAlert } from '@/store/slices/sheetBuilder/sheetBuilderSliceForm';
import { selectInitialAttributes } from '@/store/slices/sheetBuilder/sheetBuilderSliceInitialAttributes';
import {
  resetRace,
  selectSheetBuilderRace,
} from '@/store/slices/sheetBuilder/sheetBuilderSliceRaceDefinition';
import { setOptionReady } from '@/store/slices/sheetBuilder/sheetBuilderSliceStepConfirmed';
import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
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
import SheetBuildFormStepRaceDefinitionElf from './SheetBuildFormStepRaceDefinitionElf/SheetBuildFormStepRaceDefinitionElf';
import SheetBuildFormStepRaceDefinitionGoblin from './SheetBuildFormStepRaceDefinitionGoblin/SheetBuildFormStepRaceDefinitionGoblin';
import SheetBuildFormStepRaceDefinitionLefeu from './SheetBuildFormStepRaceDefinitionLefeu/SheetBuildFormStepRaceDefinitionLefeu';
import SheetBuildFormStepRaceDefinitionMinotaur from './SheetBuildFormStepRaceDefinitionMinotaur/SheetBuildFormStepRaceDefinitionMinotaur';
import SheetBuildFormStepRaceDefinitionQareen from './SheetBuildFormStepRaceDefinitionQareen/SheetBuildFormStepRaceDefinitionQareen';
import SheetBuilderFormStepRaceDefinitionDahllan from './SheetBuilderFormStepRaceDefinitionDahllan/SheetBuilderFormStepRaceDefinitionDahllan';
import SheetBuilderFormStepRaceDefinitionDwarf from './SheetBuilderFormStepRaceDefinitionDwarf/SheetBuilderFormStepRaceDefinitionDwarf';
import SheetBuilderFormStepRaceDefinitionHuman from './SheetBuilderFormStepRaceDefinitionHuman/SheetBuilderFormStepRaceDefinitionHuman';

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
  [RaceName.minotaur]: SheetBuildFormStepRaceDefinitionMinotaur,
  [RaceName.lefeu]: SheetBuildFormStepRaceDefinitionLefeu,
  [RaceName.qareen]: SheetBuildFormStepRaceDefinitionQareen,
};

const SheetBuilderFormStepRaceDefinition = () => {
  const submittedRace = useSelector(selectSheetBuilderRace);
  const [selectedRace, setSelectedRace] = React.useState<RaceName | undefined>(
    submittedRace?.name
  );

  const [attributeModifiers, setAttributeModifiers] = React.useState<
    Partial<Attributes>
  >(submittedRace?.attributeModifiers ?? {});

  useEffect(() => {
    if (submittedRace) {
      setSelectedRace(submittedRace.name);
      setAttributeModifiers(submittedRace.attributeModifiers);
    }
  }, [submittedRace]);

  const { confirm } = useSheetBuilderConfirm<Race>();
  const dispatch = useAppDispatch();
  const attributes = useAppSelector(selectInitialAttributes);

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

  const changeRace = (race?: RaceName) => {
    dispatch(setOptionReady({ key: 'isRaceReady', value: 'pending' }));
    setSelectedRace(race);
    resetState();

    if (race) {
      const RaceClass = Races.getByName(race);
      setAttributeModifiers(RaceClass.attributeModifiers);
    }
  };

  const RaceComponent = selectedRace ? raceComponents[selectedRace] : null;
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
