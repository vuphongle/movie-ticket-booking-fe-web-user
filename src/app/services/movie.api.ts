import { API_DOMAIN_MOVIE_PUBLIC } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export enum MovieAge {
  P = 'P',
  K = 'K',
  T13 = 'T13',
  T16 = 'T16',
  T18 = 'T18',
  C = 'C',
}

export interface Movie {
  id: number;
  name: string;
  slug: string;
  description: string;
  poster: string;
  trailer: string;
  age: MovieAge;
  rating: number;
  genres: string[];
  graphics: string[];
}

export const movieApi = createApi({
  reducerPath: 'movieApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_DOMAIN_MOVIE_PUBLIC,
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
        return text;
      }
    },
  }),

  endpoints: builder => ({
    getShowingNowMovies: builder.query<Movie[], void>({
      query: () => '/showing-now',
    }),
    getComingSoonMovies: builder.query<Movie[], void>({
      query: () => '/coming-soon',
    }),
  }),
});


export const {
  useGetShowingNowMoviesQuery,
  useGetComingSoonMoviesQuery,
} = movieApi;
