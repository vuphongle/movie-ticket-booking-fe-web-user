import { API_DOMAIN, API_DOMAIN_AUTH_PUBLIC } from '@lib/api';
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
  }),
});

export const {
  useLoginMutation,
  useRegisterAccountMutation,
  useVerifyAccountMutation,
} = authApi;
