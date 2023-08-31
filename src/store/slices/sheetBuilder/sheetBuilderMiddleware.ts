/* eslint-disable no-console */
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import SheetBuilder, {
  ArmorFactory,
  BuildingSheet,
  Character,
  Devotion,
  GrantedPowerFactory,
  MartialWeaponFactory,
  OriginFactory,
  OutOfGameContext,
  RaceFactory,
  RoleFactory,
  SheetBuilderError,
  SimpleWeaponFactory,
} from 't20-sheet-builder';
import { AppStartListening } from '../..';
import { takeLatest } from '../../sagas';
import {
  SavedSheet,
  setActiveSheet,
  storeCharacter,
  storeSheet,
  updateSheetDate,
} from '../sheetStorage/sheetStorage';
import { syncSheetBuilder } from './sheetBuilderActions';
import {
  resetFormAlert,
  setFormError,
  setFormSuccess,
} from './sheetBuilderSliceForm';
import {
  changeMethod,
  decrementAttribute,
  incrementAttribute,
} from './sheetBuilderSliceInitialAttributes';
import { resetRace } from './sheetBuilderSliceRaceDefinition';
import { resetRole } from './sheetBuilderSliceRoleDefinition';
import {
  resetOptionsReady,
  setOptionReady,
} from './sheetBuilderSliceStepConfirmed';

export const sheetBuilderMiddleware = createListenerMiddleware();

const startListening =
  sheetBuilderMiddleware.startListening as AppStartListening;

const isSheetBuilderAction = (type: string) => type.startsWith('sheetBuilder/');

startListening({
  predicate(action) {
    if (typeof action.type !== 'string') {
      return false;
    }

    const reduxPersistActions: string[] = [
      FLUSH,
      REHYDRATE,
      PAUSE,
      PERSIST,
      PURGE,
      REGISTER,
    ];

    const shouldTrigger =
      isSheetBuilderAction(action.type) &&
      !isAnyOf(
        setFormError,
        resetFormAlert,
        setFormSuccess,
        setOptionReady,
        setActiveSheet,
        storeSheet,
        storeCharacter,
        syncSheetBuilder,
        updateSheetDate,
        resetOptionsReady,
        changeMethod
      )(action) &&
      !reduxPersistActions.includes(action.type);
    return shouldTrigger;
  },
  effect: async (action, api) => {
    console.log('Sheet Builder Middleware', action.type);
    try {
      api.dispatch(resetFormAlert());
      console.log(action.type);
      await takeLatest(api);

      const {
        initialAttributes,
        race: { race: serializedRace },
        role: { role: serializedRole },
        origin: { origin: serializedOrigin },
        devotion: { devotion: serializedDevotion },
        details,
        initialEquipment: serializedInitialEquipment,
        intelligenceSkills,
      } = api.getState().sheetBuilder;

      const sheet = new BuildingSheet();
      const sheetBuilder = new SheetBuilder(sheet);

      sheetBuilder.setInitialAttributes(initialAttributes.attributes);

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

      if (serializedDevotion) {
        const powers = serializedDevotion.choosedPowers.map((power) =>
          GrantedPowerFactory.make(power)
        );
        sheetBuilder.addDevotion(
          new Devotion(serializedDevotion.deity, powers)
        );
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
          armor: serializedInitialEquipment.armor
            ? ArmorFactory.make(serializedInitialEquipment.armor.name)
            : undefined,
          money: serializedInitialEquipment.money,
        });
      }

      const canBuildCharacter =
        serializedRace && serializedRole && serializedOrigin;

      const updatedStore: Omit<SavedSheet, 'sheet'> = {
        id: api.getState().sheetStorage.activeSheetId,
        date: new Date().getTime(),
        name: details.name,
        image: details.image,
        form: {
          initialAttributes: {
            method: initialAttributes.method,
            remainingPoints: initialAttributes.remainingPoints,
          },
        },
      };

      if (canBuildCharacter) {
        const character = new Character(sheetBuilder.build());
        const serializedCharacter = character.serialize();
        api.dispatch(
          storeCharacter({
            ...updatedStore,
            ...serializedCharacter,
          })
        );
      } else {
        const serializedSheet = sheet.serialize(new OutOfGameContext());
        api.dispatch(
          storeSheet({
            ...updatedStore,
            sheet: serializedSheet,
          })
        );
      }

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

      // takeLatest cancels the task when a new action is dispatched
      // this should be ignored
      if ((err as Error).name === 'TaskAbortError') return;
      console.error(err);
    }
  },
});
