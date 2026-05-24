import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './services/api';
import migrationReducer from './features/migration/migrationSlice';
import analysisReducer from './features/analysis/analysisSlice';
import promptReducer from './features/prompts/promptSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    migration: migrationReducer,
    analysis: analysisReducer,
    prompts: promptReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
