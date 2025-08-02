import { logout } from '@app/slices/auth.slice';
import type { RootState } from '@app/Store';
import type { Middleware } from '@reduxjs/toolkit';
import type { JwtPayload } from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';

// Middleware kiểm tra token hết hạn để tự động đăng xuất
export const tokenMiddleware: Middleware<{}, RootState> =
  store => next => action => {
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decodedToken.exp && decodedToken.exp < currentTime) {
          store.dispatch(logout());
        }
      } catch (error) {
        console.error('Token decode error:', error);
        store.dispatch(logout());
      }
    }

    return next(action);
  };
