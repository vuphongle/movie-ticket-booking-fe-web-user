import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_DOMAIN_PUBLIC, DOMAIN } from '../../lib/api';

// Kiểu dữ liệu cho user
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

// Kiểu dữ liệu phản hồi từ login
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Kiểu dữ liệu truyền vào login
interface LoginRequest {
  email: string;
  password: string;
}

// Kiểu dữ liệu truyền vào đăng ký
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Kiểu dữ liệu quên mật khẩu
interface ForgotPasswordRequest {
  email: string;
}

// Kiểu dữ liệu đổi mật khẩu
interface ChangePasswordRequest {
  token: string;
  newPassword: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_DOMAIN_PUBLIC }),
  endpoints: builder => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: credentials => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: LoginResponse): LoginResponse => {
        return {
          ...response,
          user: {
            ...response.user,
            avatar: response.user.avatar.startsWith('/api')
              ? `${DOMAIN}${response.user.avatar}`
              : response.user.avatar,
          },
        };
      },
    }),

    registerAccount: builder.mutation<void, RegisterRequest>({
      query: data => ({
        url: 'auth/register',
        method: 'POST',
        body: data,
      }),
    }),

    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: ({ email }) => ({
        url: 'auth/forgot-password',
        method: 'POST',
        params: {
          email,
        },
      }),
    }),

    checkForgotPasswordToken: builder.query<void, string>({
      query: token => ({
        url: `auth/check-forgot-password-token/${token}`,
        method: 'GET',
      }),
    }),

    checkRegisterToken: builder.query<void, string>({
      query: token => ({
        url: `auth/check-register-token/${token}`,
        method: 'GET',
      }),
    }),

    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: data => ({
        url: 'auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterAccountMutation,
  useForgotPasswordMutation,
  useCheckForgotPasswordTokenQuery,
  useChangePasswordMutation,
  useCheckRegisterTokenQuery,
} = authApi;
