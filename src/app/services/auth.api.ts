import { API_DOMAIN, API_BASE_URL, API_DOMAIN_AUTH_PUBLIC } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const ENDPOINT = API_DOMAIN_AUTH_PUBLIC;

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    [key: string]: any;
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
          url: 'login',
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
      }
    >({
      query: data => ({
        url: 'register',
        method: 'POST',
        body: data,
      }),
    }),
    verifyAccount: builder.mutation<void, string>({
      query: token => ({
        url: `check-register-token/${encodeURIComponent(token)}`,
        method: 'GET',
      }),
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: data => ({
        url: 'forgot-password',
        method: 'GET',
        params: { email: data.email },
      }),
    }),

    checkForgotPasswordToken: builder.query<
      { token: string; success: boolean; message: string },
      string
    >({
      query: token => ({
        url: `check-forgot-password-token/${encodeURIComponent(token)}`,
        method: 'GET',
      }),
    }),

    resetPassword: builder.mutation<
      void,
      { token: string; newPassword: string; confirmPassword: string }
    >({
      query: data => ({
        url: 'change-password',
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

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
    responseHandler: async response => {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    },
  }),

  endpoints: builder => ({
    changePassword: builder.mutation<
      void,
      { currentPassword: string; newPassword: string; confirmPassword: string }
    >({
      query: data => ({
        url: 'users/update-password',
        method: 'PUT',
        body: {
          oldPassword: data.currentPassword,
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

export const { useChangePasswordMutation } = userApi;
