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
import authReducer from './slices/auth/authSlice';
import sheetsReducer from './slices/sheets/sheetsSlice';
import systemReducer from './slices/system/systemSlice';
import subscriptionReducer from './slices/subscription/subscriptionSlice';
import notificationReducer from './slices/notification/notificationSlice';
import { onActiveSheetChangeMiddleware } from './middlewares/onActiveSheetChangeMiddleware';

export const persistConfig = {
  key: 'sheetStorage',
  storage,
};

export const threatPersistConfig = {
  key: 'threatStorage',
  storage,
};

export const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['dbUser'], // Only persist dbUser, Firebase will handle its own state
};

export const systemPersistConfig = {
  key: 'system',
  storage,
  whitelist: ['selectedSystem'], // Persist user's system preference
};

export const subscriptionPersistConfig = {
  key: 'subscription',
  storage,
  whitelist: ['subscription', 'limits'], // Persist subscription data and limits
};

const persistedReducer = persistReducer(
  persistConfig,
  sheetStorageSlice.reducer
);

const persistedThreatReducer = persistReducer(
  threatPersistConfig,
  threatStorageReducer
);

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const persistedSystemReducer = persistReducer(
  systemPersistConfig,
  systemReducer
);

const persistedSubscriptionReducer = persistReducer(
  subscriptionPersistConfig,
  subscriptionReducer
);

const store = configureStore({
  reducer: {
    sheetBuilder: sheetBuilderReducer,
    sheetStorage: persistedReducer,
    threatStorage: persistedThreatReducer,
    auth: persistedAuthReducer,
    sheets: sheetsReducer,
    system: persistedSystemReducer,
    subscription: persistedSubscriptionReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          'auth/setFirebaseUser',
          'auth/login/fulfilled',
          'auth/register/fulfilled',
        ],
        ignoredPaths: ['auth.firebaseUser'],
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
