import { API_DOMAIN_PUBLIC } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const additionalServiceApi = createApi({
  reducerPath: 'additionalServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_DOMAIN_PUBLIC,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
    responseHandler: async response => {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return {};
      }
    },
  }),
  endpoints: builder => ({
    getAllAdditionalServices: builder.query<string[], void>({
      query: () => `/additional-services`,
    }),
  }),
});

export const { useGetAllAdditionalServicesQuery } = additionalServiceApi;
