import { API_BASE_URL } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface UserResponse {
  id: number;
  name: string;
  dob: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  cinema: any;
}

interface UploadAvatarResponse {
  url: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  message: string;
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
  tagTypes: ['User'],

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
    
    uploadAvatar: builder.mutation<UploadAvatarResponse, FormData>({
      query: (formData) => ({
        url: 'users/upload-avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),
    
    updateProfile: builder.mutation<
      UserResponse,
      { name: string; phone: string; dob: string; avatar?: string }
    >({
      query: data => ({
        url: 'users/update-profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useChangePasswordMutation, useUpdateProfileMutation, useUploadAvatarMutation } = userApi;