import { TypedStartListening, configureStore } from '@reduxjs/toolkit';
import { sheetBuilderReducer } from './slices/sheetBuilder/sheetBuilderSlice';
import { sheetBuilderMiddleware } from './slices/sheetBuilder/sheetBuilderMiddleware';

const store = configureStore({
  reducer: {
    sheetBuilder: sheetBuilderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(sheetBuilderMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

export default store;
