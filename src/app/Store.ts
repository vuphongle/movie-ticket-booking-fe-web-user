import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@app/slices/auth.slice';
import { authApi } from '@/app/services/auth.api';
import {userApi } from '@/app/services/user.api';
import { checkStatusMiddleware } from '@app/middlewares/middlewares';

export const Store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(authApi.middleware, userApi.middleware, checkStatusMiddleware),
});

export type RootState = ReturnType<typeof Store.getState>;
