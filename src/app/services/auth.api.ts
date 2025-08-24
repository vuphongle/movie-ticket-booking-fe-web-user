import { API_DOMAIN, API_DOMAIN_PUBLIC } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const ENDPOINT = API_DOMAIN_PUBLIC;

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    [key: string]: any;
    dob: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: ENDPOINT }),
  endpoints: builder => ({
    login: builder.mutation<LoginResponse, { email: string; password: string }>(
      {
        query: credentials => ({
          url: 'auth/login',
          method: 'POST',
          body: credentials,
        }),
        transformResponse: (response: LoginResponse) => {
          return {
            ...response,
            user: {
              ...response.user,
              avatar: response.user.avatar.startsWith('/api')
                ? `${API_DOMAIN}${response.user.avatar}`
                : response.user.avatar,
            },
          };
        },
      }
    ),
    registerAccount: builder.mutation<
      void,
      {
        name: string;
        email: string;
        phone: string;
        password: string;
        confirmPassword: string;
        dob: string;
      }
    >({
      query: data => ({
        url: 'auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    verifyAccount: builder.mutation<void, string>({
      query: token => ({
        url: `auth/check-register-token/${encodeURIComponent(token)}`,
        method: 'GET',
      }),
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: data => ({
        url: 'auth/forgot-password',
        method: 'GET',
        params: { email: data.email },
      }),
    }),

    checkForgotPasswordToken: builder.query<
      { token: string; success: boolean; message: string },
      string
    >({
      query: token => ({
        url: `auth/check-forgot-password-token/${encodeURIComponent(token)}`,
        method: 'GET',
      }),
    }),

    resetPassword: builder.mutation<
      void,
      { token: string; newPassword: string; confirmPassword: string }
    >({
      query: data => ({
        url: `auth/change-password`,
        method: 'POST',
        body: {
          token: data.token,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterAccountMutation,
  useVerifyAccountMutation,
  useForgotPasswordMutation,
  useCheckForgotPasswordTokenQuery,
  useResetPasswordMutation,
} = authApi;
