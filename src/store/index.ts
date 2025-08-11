import { TypedStartListening, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { sheetBuilderMiddleware } from './slices/sheetBuilder/sheetBuilderMiddleware';
import { sheetBuilderReducer } from './slices/sheetBuilder/sheetBuilderSlice';
import { sheetStorageSlice } from './slices/sheetStorage/sheetStorage';
import threatStorageReducer from './slices/threatStorage';
import { onActiveSheetChangeMiddleware } from './middlewares/onActiveSheetChangeMiddleware';

export const persistConfig = {
  key: 'sheetStorage',
  storage,
};

export const threatPersistConfig = {
  key: 'threatStorage',
  storage,
};

const persistedReducer = persistReducer(
  persistConfig,
  sheetStorageSlice.reducer
);

const persistedThreatReducer = persistReducer(
  threatPersistConfig,
  threatStorageReducer
);

const store = configureStore({
  reducer: {
    sheetBuilder: sheetBuilderReducer,
    sheetStorage: persistedReducer,
    threatStorage: persistedThreatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .prepend(sheetBuilderMiddleware.middleware)
      .prepend(onActiveSheetChangeMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

export const persistor = persistStore(store);

export default store;
