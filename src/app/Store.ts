import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@app/slices/auth.slice';
import { authApi } from '@/app/services/auth.api';
import { checkStatusMiddleware } from '@app/middlewares/middlewares';

export const Store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(authApi.middleware, checkStatusMiddleware),
});

export type RootState = ReturnType<typeof Store.getState>;
