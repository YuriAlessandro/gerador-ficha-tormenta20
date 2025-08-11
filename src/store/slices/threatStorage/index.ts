import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThreatSheet } from '../../../interfaces/ThreatSheet';

interface ThreatStorageState {
  threats: ThreatSheet[];
  selectedThreatId: string | null;
}

const initialState: ThreatStorageState = {
  threats: [],
  selectedThreatId: null,
};

const threatStorageSlice = createSlice({
  name: 'threatStorage',
  initialState,
  reducers: {
    saveThreat: (state, action: PayloadAction<ThreatSheet>) => {
      // Check if threat already exists
      const existingIndex = state.threats.findIndex(
        (t) => t.id === action.payload.id
      );

      if (existingIndex >= 0) {
        // Update existing threat
        state.threats[existingIndex] = action.payload;
      } else {
        // Add new threat
        state.threats.push(action.payload);
      }
    },
    deleteThreat: (state, action: PayloadAction<string>) => {
      state.threats = state.threats.filter((t) => t.id !== action.payload);
      if (state.selectedThreatId === action.payload) {
        state.selectedThreatId = null;
      }
    },
    selectThreat: (state, action: PayloadAction<string | null>) => {
      state.selectedThreatId = action.payload;
    },
    clearAllThreats: (state) => {
      state.threats = [];
      state.selectedThreatId = null;
    },
  },
});

export const { saveThreat, deleteThreat, selectThreat, clearAllThreats } =
  threatStorageSlice.actions;

export default threatStorageSlice.reducer;
