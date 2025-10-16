import { API_DOMAIN_PUBLIC } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Cinema {
  id: number;
  name: string;
  address: string;
  mapLocation: string;
}

export const cineApi = createApi({
  reducerPath: 'cineApi',
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
    getAllCinemaNames: builder.query<string[], void>({
      query: () => `/cinemas/getAllNames`,
    }),
    getAllCities: builder.query<string[], void>({
      query: () => `/cinemas/getAllCities`,
    }),
    getAllCinemas: builder.query<Cinema[], void>({ 
      query: () => `/cinemas`,
    }),
    getAuditoriumsByCinemaId: builder.query<any[], { cinemaId: string }>({ // tùy chỉnh interface nếu có
      query: ({ cinemaId }) => `/cinemas/${cinemaId}/auditoriums`,
    }),
    getCinemaById: builder.query<Cinema, { cinemaId: string }>({      query: ({ cinemaId }) => `/cinemas/${cinemaId}`,
    }),
  }),
});

export const { useGetAllCinemaNamesQuery, useGetAllCitiesQuery, useGetAllCinemasQuery, useGetAuditoriumsByCinemaIdQuery, useGetCinemaByIdQuery } = cineApi;
