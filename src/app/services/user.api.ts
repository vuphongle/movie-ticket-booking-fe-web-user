import { API_BASE_URL } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface UserResponse {
  id: string;
  name: string;
  email: string;
  avatar: string;
  [key: string]: any;
}

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

export const { useChangePasswordMutation } = userApi;