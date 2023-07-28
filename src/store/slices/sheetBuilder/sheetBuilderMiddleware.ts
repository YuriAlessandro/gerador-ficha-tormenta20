import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import SheetBuilder, {
  BuildingSheet,
  Devotion,
  LeatherArmor,
  MartialWeaponFactory,
  OriginFactory,
  OutOfGameContext,
  RaceFactory,
  RoleFactory,
  SheetBuilderError,
  SheetSerializer,
  SimpleWeaponFactory,
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
import {
  Attacks,
  updateAttacks,
  updatePreview,
} from './sheetBuilderSliceSheetPreview';
import { setOptionReady } from './sheetBuilderSliceStepConfirmed';

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
        setFormSuccess,
        updateAttacks,
        setOptionReady
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
        devotion,
        initialEquipment: serializedInitialEquipment,
        intelligenceSkills,
      } = api.getState().sheetBuilder;

      const sheet = new BuildingSheet();
      const sheetBuilder = new SheetBuilder(sheet);
      const serializer = new SheetSerializer(new OutOfGameContext());

      sheetBuilder.setInitialAttributes(initialAttributes);

      if (serializedRace) {
        const race = RaceFactory.makeFromSerialized(serializedRace);
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

      if (intelligenceSkills.skills.length > 0) {
        sheetBuilder.trainIntelligenceSkills(intelligenceSkills.skills);
      }

      if (devotion) {
        sheetBuilder.addDevotion(devotion.deity as Devotion);
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

      if (serializedRace && serializedRole && serializedOrigin) {
        const attacks: Attacks[] = [];
        sheet.getAttacks().forEach((attack, name) => {
          attacks.push({
            name,
            details: attack.serialize(sheet, new OutOfGameContext()),
          });
        });

        api.dispatch(updateAttacks(attacks));
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
