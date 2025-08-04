import authReducer from '@app/slices/auth.slice';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
