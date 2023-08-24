import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Attribute, Attributes } from 't20-sheet-builder';
import { RootState } from '../..';
import { AttributesDefinitionType } from '../sheetStorage/sheetStorage';
import { setActiveSheetToBuilder } from './sheetBuilderActions';

export type SheetBuilderInitialAttributesState = {
  attributes: Attributes;
  method: AttributesDefinitionType;
};

const createInitialState = (): SheetBuilderInitialAttributesState => ({
  attributes: {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
  },
  method: 'dice',
});

export const sheetBuilderSliceInitialAttributes = createSlice({
  name: 'sheetBuilder/initialAttributes',
  initialState: createInitialState(),
  reducers: {
    setAttributes: (state, action: PayloadAction<Attributes>) => {
      state.attributes = action.payload;
    },
    incrementAttribute: (state, action: PayloadAction<Attribute>) => {
      state.attributes[action.payload] += 1;
    },
    decrementAttribute: (state, action: PayloadAction<Attribute>) => {
      state.attributes[action.payload] -= 1;
    },
    setMethod: (state, action: PayloadAction<AttributesDefinitionType>) => {
      state.method = action.payload;
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
      const initialState = createInitialState();
      state.attributes = initialState.attributes;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setActiveSheetToBuilder, (state, action) => {
      state.attributes = action.payload.sheet.sheet.initialAttributes;
      state.method = action.payload.sheet.initialAttributesMethod;
    });
  },
});

export const {
  incrementAttribute,
  decrementAttribute,
  setAttribute,
  resetAttributes,
  setAttributes,
  setMethod,
} = sheetBuilderSliceInitialAttributes.actions;

export const selectAttributes = (state: RootState) =>
  state.sheetBuilder.initialAttributes.attributes;
export const selectAttribute = (attribute: Attribute) => (state: RootState) =>
  state.sheetBuilder.initialAttributes.attributes[attribute];
export const selectInitialAttributesMethod = (state: RootState) =>
  state.sheetBuilder.initialAttributes.method;

export default sheetBuilderSliceInitialAttributes;
