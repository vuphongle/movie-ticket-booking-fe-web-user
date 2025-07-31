import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import {
  getDataFromLocalStorage,
  setDataToLocalStorage,
} from '../../utils/localStorageUtils';
import { authApi } from '../services/auth.api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  [key: string]: any;
}

export interface AuthState {
  auth: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const defaultState: AuthState = {
  auth: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

const initialState: AuthState =
  getDataFromLocalStorage('authenticatedUser') || defaultState;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: () => {
      setDataToLocalStorage('authenticatedUser', defaultState);
      return defaultState;
    },
    updateAuth: (state, action: PayloadAction<Partial<User>>) => {
      state.auth = { ...state.auth, ...action.payload } as User;
      setDataToLocalStorage('authenticatedUser', state);
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action) => {
        const { user, accessToken, refreshToken } = action.payload;
        state.auth = user;
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true; // <-- bạn tự đặt ở đây thay vì lấy từ payload
        setDataToLocalStorage('authenticatedUser', state);
      }
    );
  },
});

export const { logout, updateAuth } = authSlice.actions;

export default authSlice.reducer;
