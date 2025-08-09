import { API_DOMAIN, API_DOMAIN_AUTH_PUBLIC } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const ENDPOINT = API_DOMAIN_AUTH_PUBLIC;

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: ENDPOINT }),
  endpoints: builder => ({
    login: builder.mutation({
      query: credentials => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: { user: { avatar: string } }) => {
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
    }),
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
  }),
});

export const { useLoginMutation, useRegisterAccountMutation } = authApi;
