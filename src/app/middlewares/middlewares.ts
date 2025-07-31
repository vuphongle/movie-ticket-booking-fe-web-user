import type { Middleware } from '@reduxjs/toolkit';
import { logout } from '../slices/auth.slice';

// Middleware kiểm tra trạng thái của các action để tự động đăng xuất nếu nhận được lỗi 401
export const checkStatusMiddleware: Middleware =
  ({ dispatch }) =>
  next =>
  action => {
    if (action.type.endsWith('rejected')) {
      const { payload, error } = action as {
        payload?: { status?: number };
        error?: any;
        type: string;
      };

      if (error && payload?.status === 401) {
        dispatch(logout());
      }
    }

    return next(action);
  };
