import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import SheetBuilder, {
  BuildingSheet,
  Dwarf,
  Human,
  LeatherArmor,
  MartialWeaponFactory,
  OriginFactory,
  OutOfGameContext,
  Race,
  RaceInterface,
  RaceName,
  RoleFactory,
  SheetBuilderError,
  SheetSerializer,
  SimpleWeaponFactory,
  VersatileChoiceFactory,
} from 't20-sheet-builder';
import { AppStartListening } from '../..';
import { takeLatest } from '../../sagas';
import {
  resetFormAlert,
  setFormError,
  setFormSuccess,
} from './sheetBuilderSliceForm';
import {
  decrementAttribute,
  incrementAttribute,
} from './sheetBuilderSliceInitialAttributes';
import { resetRace } from './sheetBuilderSliceRaceDefinition';
import { resetRole } from './sheetBuilderSliceRoleDefinition';
import { updatePreview } from './sheetBuilderSliceSheetPreview';
import {
  SheetBuilderStateRace,
  SheetBuilderStateRaceDwarf,
  SheetBuilderStateRaceHuman,
} from './types';

const makeHuman = (serializedRace: SheetBuilderStateRaceHuman) => {
  const choices = serializedRace.versatileChoices.map((choice) =>
    VersatileChoiceFactory.make(choice.type, choice.name)
  );
  return new Human(serializedRace.selectedAttributes, choices) as Race;
};

const makeDwarf = (_serializedRace: SheetBuilderStateRaceDwarf) => new Dwarf();

function makeRace(serializedRace: SheetBuilderStateRace): RaceInterface {
  switch (serializedRace.name) {
    case RaceName.human:
      return makeHuman(serializedRace);
    case RaceName.dwarf:
      return makeDwarf(serializedRace);
    default:
      throw new Error(`UNKNOWN_RACE`);
  }
}

export const sheetBuilderMiddleware = createListenerMiddleware();

const startListening =
  sheetBuilderMiddleware.startListening as AppStartListening;

const isSheetBuilderAction = (type: string) => type.startsWith('sheetBuilder/');

startListening({
  predicate(action) {
    if (typeof action.type !== 'string') {
      return false;
    }
    const shouldTrigger =
      isSheetBuilderAction(action.type) &&
      !isAnyOf(
        updatePreview,
        setFormError,
        resetFormAlert,
        setFormSuccess
      )(action);
    return shouldTrigger;
  },
  effect: async (action, api) => {
    try {
      api.dispatch(resetFormAlert());
      await takeLatest(api);

      const {
        initialAttributes,
        race: { race: serializedRace },
        role: { role: serializedRole },
        origin: { origin: serializedOrigin },
        initialEquipment: serializedInitialEquipment,
      } = api.getState().sheetBuilder;

      const sheet = new BuildingSheet();
      const sheetBuilder = new SheetBuilder(sheet);
      const serializer = new SheetSerializer(new OutOfGameContext());

      sheetBuilder.setInitialAttributes(initialAttributes);

      if (serializedRace) {
        const race = makeRace(serializedRace);
        sheetBuilder.chooseRace(race);
      }

      if (serializedRole) {
        const role = RoleFactory.makeFromSerialized(serializedRole);
        sheetBuilder.chooseRole(role);
      }

      if (serializedOrigin) {
        const origin = OriginFactory.makeFromSerialized(serializedOrigin);
        sheetBuilder.chooseOrigin(origin);
      }

      if (serializedInitialEquipment.simpleWeapon) {
        sheetBuilder.addInitialEquipment({
          simpleWeapon: SimpleWeaponFactory.makeFromSerialized(
            serializedInitialEquipment.simpleWeapon
          ),
          martialWeapon: serializedInitialEquipment.martialWeapon
            ? MartialWeaponFactory.makeFromSerialized(
                serializedInitialEquipment.martialWeapon
              )
            : undefined,
          armor: new LeatherArmor(),
          money: serializedInitialEquipment.money,
        });
      }

      api.dispatch(updatePreview(serializer.serialize(sheet)));

      const shouldDispatchSuccess = !isAnyOf(
        incrementAttribute,
        decrementAttribute,
        resetRace,
        resetRole
      )(action);

      if (shouldDispatchSuccess) {
        api.dispatch(setFormSuccess(`Ficha atualizada: ${action.type}`));
      }
    } catch (err) {
      if (err instanceof SheetBuilderError) {
        api.dispatch(setFormError(err.message));
      }
    }
  },
});
