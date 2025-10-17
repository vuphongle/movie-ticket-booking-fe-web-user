import { API_DOMAIN_PUBLIC } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export enum MovieAge {
  P = 'P',
  K = 'K',
  T13 = 'T13',
  T16 = 'T16',
  T18 = 'T18',
  C = 'C',
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
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
  genres: Genre[];
  graphics: string[];
}

export interface MovieDetail extends Movie {
  nameEn: string;
  releaseYear: number;
  duration: number;
  status: boolean;
  showDate: string;
  translations: string[];
  country: {
    id: number;
    name: string;
    slug: string;
  };
  directors: {
    id: number;
    name: string;
    avatar: string;
  }[];
  actors: {
    id: number;
    name: string;
    avatar: string;
  }[];
  reviews: {
    id: number;
    comment: string;
    rating: number;
    images: string[];
    createdAt: string;
    user: {
      id: number;
      name: string;
      avatar: string;
      role: string;
    };
  }[];
}

export const movieApi = createApi({
  reducerPath: 'movieApi',
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
        return text;
      }
    },
  }),
  endpoints: builder => ({
    getShowingNowMovies: builder.query<Movie[], void>({
      query: () => '/movies/showing-now',
    }),
    getComingSoonMovies: builder.query<Movie[], void>({
      query: () => '/movies/coming-soon',
    }),
    getMovieDetail: builder.query<MovieDetail, { id: number; slug: string }>({
      query: ({ id, slug }) => `/movies/${id}/${slug}`,
    }),
    getMovieByShowtime: builder.query<Movie, number>({
      query: id => `/movie-by-showtimeId/${id}`,
    }),
    searchMovies: builder.query({
      query: (keyword: string) =>
        `/movies/search?keyword=${encodeURIComponent(keyword)}`,
    }),
  }),
});

export const {
  useGetShowingNowMoviesQuery,
  useGetComingSoonMoviesQuery,
  useGetMovieDetailQuery,
  useGetMovieByShowtimeQuery,
  useSearchMoviesQuery,
} = movieApi;
