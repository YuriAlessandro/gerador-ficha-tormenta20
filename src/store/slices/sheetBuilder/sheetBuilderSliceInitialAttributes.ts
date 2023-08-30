import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Attribute, Attributes } from 't20-sheet-builder';
import { RootState } from '../..';
import { AttributesDefinitionType } from '../sheetStorage/sheetStorage';
import { syncSheetBuilder } from './sheetBuilderActions';

export type SheetBuilderInitialAttributesState = {
  attributes: Attributes;
  method: AttributesDefinitionType;
  remainingPoints?: number;
  dices?: number[];
};

const createInitialAttributes = (): Attributes => ({
  strength: 0,
  dexterity: 0,
  constitution: 0,
  intelligence: 0,
  wisdom: 0,
  charisma: 0,
});

const createInitialState = (): SheetBuilderInitialAttributesState => ({
  attributes: createInitialAttributes(),
  method: 'dice',
});

export const sheetBuilderSliceInitialAttributes = createSlice({
  name: 'sheetBuilder/initialAttributes',
  initialState: createInitialState(),
  reducers: {
    setAttributes: (state, action: PayloadAction<Attributes>) => {
      state.attributes = action.payload;
    },
    buyAttribute: (
      state,
      action: PayloadAction<{ attribute: Attribute; remainingPoints: number }>
    ) => {
      state.attributes[action.payload.attribute] += 1;
      state.remainingPoints = action.payload.remainingPoints;
    },
    sellAttribute: (
      state,
      action: PayloadAction<{ attribute: Attribute; remainingPoints: number }>
    ) => {
      state.attributes[action.payload.attribute] -= 1;
      state.remainingPoints = action.payload.remainingPoints;
    },
    incrementAttribute: (state, action: PayloadAction<Attribute>) => {
      state.attributes[action.payload] += 1;
    },
    decrementAttribute: (state, action: PayloadAction<Attribute>) => {
      state.attributes[action.payload] -= 1;
    },
    changeMethod: (state, action: PayloadAction<AttributesDefinitionType>) => {
      state.method = action.payload;
      state.attributes = createInitialAttributes();

      if (action.payload === 'dice') {
        state.remainingPoints = undefined;
        state.dices = [];
      }

      if (action.payload === 'points') {
        state.remainingPoints = 10;
        state.dices = undefined;
      }
    },
    setRemainingPoints: (state, action: PayloadAction<number>) => {
      state.remainingPoints = action.payload;
    },
    setAttribute: (
      state,
      action: PayloadAction<{
        attribute: Attribute;
        value: number;
      }>
    ) => {
      state.attributes[action.payload.attribute] = action.payload.value;
    },
    resetAttributes: (state) => {
      state.attributes = createInitialAttributes();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(syncSheetBuilder, (state, action) => {
      state.attributes = action.payload.sheet.sheet.initialAttributes;
      state.method = action.payload.sheet.form.initialAttributes.method;
      state.remainingPoints =
        action.payload.sheet.form.initialAttributes.remainingPoints;
    });
  },
});

export const {
  incrementAttribute,
  decrementAttribute,
  setAttribute,
  setRemainingPoints,
  resetAttributes,
  setAttributes,
  buyAttribute,
  sellAttribute,
  changeMethod,
} = sheetBuilderSliceInitialAttributes.actions;

export const selectInitialAttributes = (state: RootState) =>
  state.sheetBuilder.initialAttributes.attributes;
export const selectAttribute = (attribute: Attribute) => (state: RootState) =>
  state.sheetBuilder.initialAttributes.attributes[attribute];
export const selectInitialAttributesMethod = (state: RootState) =>
  state.sheetBuilder.initialAttributes.method;
export const selectInitialAttributesRemainingPoints = (state: RootState) =>
  state.sheetBuilder.initialAttributes.remainingPoints;

export default sheetBuilderSliceInitialAttributes;
