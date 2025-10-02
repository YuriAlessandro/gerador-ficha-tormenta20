import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SystemId, SystemInfo } from '../../../types/system.types';

export interface SystemState {
  selectedSystem: SystemId;
  availableSystems: SystemInfo[];
  loading: boolean;
  error: string | null;
}

const initialState: SystemState = {
  selectedSystem: SystemId.TORMENTA20,
  availableSystems: [],
  loading: false,
  error: null,
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setSelectedSystem: (state, action: PayloadAction<SystemId>) => {
      state.selectedSystem = action.payload;
    },
    setAvailableSystems: (state, action: PayloadAction<SystemInfo[]>) => {
      state.availableSystems = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetSystemState: (state) => {
      state.selectedSystem = SystemId.TORMENTA20;
      state.availableSystems = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setSelectedSystem,
  setAvailableSystems,
  setLoading,
  setError,
  resetSystemState,
} = systemSlice.actions;

export default systemSlice.reducer;
