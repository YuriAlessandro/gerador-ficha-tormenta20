import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GrimoireSyncStatus } from '../../../interfaces/PocketGrimoire';

/** Estado da conexão com a conta. Transitório: não vai para o localStorage. */
interface PocketGrimoireSyncStatusState {
  status: GrimoireSyncStatus;
  /** Uma página do grimório foi aberta: o sync deve ser ativado. */
  requested: boolean;
}

const initialState: PocketGrimoireSyncStatusState = {
  status: 'idle',
  requested: false,
};

const pocketGrimoireSyncStatusSlice = createSlice({
  name: 'pocketGrimoireSyncStatus',
  initialState,
  reducers: {
    setSyncStatus(state, action: PayloadAction<GrimoireSyncStatus>) {
      state.status = action.payload;
    },
    requestGrimoireSync(state) {
      state.requested = true;
    },
  },
});

export const { setSyncStatus, requestGrimoireSync } =
  pocketGrimoireSyncStatusSlice.actions;

export default pocketGrimoireSyncStatusSlice.reducer;

export interface WithGrimoireSyncStatus {
  pocketGrimoireSyncStatus: PocketGrimoireSyncStatusState;
}

export const selectGrimoireSyncStatus = (state: WithGrimoireSyncStatus) =>
  state.pocketGrimoireSyncStatus.status;

export const selectGrimoireSyncRequested = (state: WithGrimoireSyncStatus) =>
  state.pocketGrimoireSyncStatus.requested;
