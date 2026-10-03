import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/** O item que o "Trocar" do aviso quer levar para outro grimório. */
export interface GrimoireMoveRequest {
  itemId: string;
  itemName: string;
  fromId: string;
}

interface GrimoireMoveState {
  request: GrimoireMoveRequest | null;
}

const initialState: GrimoireMoveState = { request: null };

/**
 * O aviso some ao clicar em "Trocar", e o botão que o gerou pode já ter saído
 * da tela; por isso o pedido mora no store e um único diálogo, montado no App,
 * o atende. Transitório: não vai para o localStorage.
 */
const grimoireMoveSlice = createSlice({
  name: 'grimoireMove',
  initialState,
  reducers: {
    requestGrimoireMove(state, action: PayloadAction<GrimoireMoveRequest>) {
      state.request = action.payload;
    },
    closeGrimoireMove(state) {
      state.request = null;
    },
  },
});

export const { requestGrimoireMove, closeGrimoireMove } =
  grimoireMoveSlice.actions;

export default grimoireMoveSlice.reducer;

export interface WithGrimoireMove {
  grimoireMove: GrimoireMoveState;
}

export const selectGrimoireMove = (state: WithGrimoireMove) =>
  state.grimoireMove.request;
