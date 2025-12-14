import { API_DOMAIN_PUBLIC } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

type BaseResponse<T> = {
  success: boolean;
  data: T;
};


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
  nameEn?: string;
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
    updatedAt: string;
    feeling: string[];
    user: {
      id: number;
      name: string;
      avatar: string;
      role: string;
    };
  }[];
}

export interface SearchMovieResult {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  poster: string;
  rating: number;
  duration: number;
  age: MovieAge;
  graphics: string[];
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
  tagTypes: ['MovieDetail'],
  endpoints: builder => ({
    getShowingNowMovies: builder.query<Movie[], void>({
      query: () => '/movies/showing-now',
    }),
    getComingSoonMovies: builder.query<Movie[], void>({
      query: () => '/movies/coming-soon',
    }),
    getMovieDetail: builder.query<MovieDetail, { id: number; slug: string }>({
      query: ({ id, slug }) => `/movies/${id}/${slug}`,
      providesTags: (_result, _error, { id }) => [{ type: 'MovieDetail', id }],
    }),
    getMovieByShowtime: builder.query<Movie, number>({
      query: id => `/movie-by-showtimeId/${id}`,
    }),
    searchMovies: builder.query({
      query: (keyword: string) =>
        `/movies/search?keyword=${encodeURIComponent(keyword)}`,
    }),
    searchByImage: builder.mutation<BaseResponse<SearchMovieResult[]>, File>({
      query: file => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/movies/search-by-image',
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useGetShowingNowMoviesQuery,
  useGetComingSoonMoviesQuery,
  useGetMovieDetailQuery,
  useGetMovieByShowtimeQuery,
  useSearchMoviesQuery,
  useSearchByImageMutation,
} = movieApi;
