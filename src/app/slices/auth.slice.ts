import { authApi } from '@app/services/auth.api';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import {
  getDataFromLocalStorage,
  setDataToLocalStorage,
} from '@utils/localStorageUtils';

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

// State mặc định khi chưa đăng nhập
const defaultState: AuthState = {
  auth: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

// Lấy từ localStorage nếu có, không thì dùng default
const initialState: AuthState =
  getDataFromLocalStorage('authenticatedUser') || defaultState;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: () => {
      // Xóa hết thông tin user và token
      setDataToLocalStorage('authenticatedUser', defaultState);
      return defaultState;
    },
    updateAuth: (state, action: PayloadAction<Partial<User>>) => {
      // Cập nhật thông tin user (ví dụ đổi avatar, tên)
      state.auth = { ...state.auth, ...action.payload } as User;
      setDataToLocalStorage('authenticatedUser', state);
    },
  },
  extraReducers: builder => {
    // Khi login thành công → lưu thông tin vào store & localStorage
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action) => {
        const { user, accessToken, refreshToken } = action.payload;
        state.auth = user;
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
        setDataToLocalStorage('authenticatedUser', state);
      }
    );

    // Khi verifyAccount thành công → không login, chỉ set trạng thái xác thực email
    builder.addMatcher(
      authApi.endpoints.verifyAccount.matchFulfilled,
      state => {
        // Chỉ đánh dấu là verified tạm (nếu muốn)
        if (state.auth) {
          state.auth.isVerified = true;
          setDataToLocalStorage('authenticatedUser', state);
        }
      }
    );
  },
});

export const { logout, updateAuth } = authSlice.actions;

export default authSlice.reducer;
