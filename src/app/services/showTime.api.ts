import { API_DOMAIN_PUBLIC } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { formatGraphicLabel } from '@utils/functionUtils';

export interface ShowtimeDto {
  id: number;
  movieId: number;
  cinema: {
    id: number;
    name: string;
    location: string;
  };
  auditorium: {
    id: number;
    name: string;
    totalSeats: number;
    totalRows: number;
    totalColumns: number;
    type: string;
  };
  format: string;
  date: string;
  startTime: string;
}

export interface MovieWithShowtimesDto {
  id: number;
  name: string;
  nameEn: string;
  description: string;
  duration: number;
  poster: string;
  rating: number;
  releaseYear: number;
  age: string;
  trailer: string;
  status: boolean;
  slug: string;
  createdAt: number;
  updatedAt: number;
  graphics: string[];
  translations: string[];
  countryId: number | null;
  showtimes: ShowtimeDto2[];
}

export interface ShowtimeDto2 {
  id: number;
  date: number[];
  startTime: string;
  endTime: string;
  graphicsType: string;
  translationType: string;
  cinemaId: number;
  cinemaName: string;
  cinemaLocation: string;
  auditoriumId: number;
  auditoriumName: string;
  auditoriumTotalSeats: number;
  auditoriumTotalRows: number;
  auditoriumTotalColumns: number;
  auditoriumType: string;
  createdAt: number;
  updatedAt: number;
}

export const showtimeApi = createApi({
  reducerPath: 'showtimeApi',
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
    getShowtimesByMovie: builder.query<
      ShowtimeDto[],
      { movieId: number; showDate: string }
    >({
      query: ({ movieId, showDate }) =>
        `/movies/${movieId}/showtimes?showDate=${showDate}`,
      transformResponse: (response: any[]) => {
        return response.map(st => {
          const graphicsLabel = formatGraphicLabel(st.graphicsType);

          const translation = (st.translationType || '').trim().toUpperCase();

          const formatKey = translation
            ? `SHOWTIME_${graphicsLabel}_${translation}`
            : `SHOWTIME_${graphicsLabel}`;

          return {
            id: st.id,
            movieId: st.movie?.id,
            cinema: {
              id: st.auditorium?.cinema?.id,
              name: st.auditorium?.cinema?.name,
              location: st.auditorium?.cinema?.address,
            },
            auditorium: {
              id: st.auditorium?.id,
              name: st.auditorium?.name,
              totalSeats: st.auditorium?.totalSeats,
              totalRows: st.auditorium?.totalRows,
              totalColumns: st.auditorium?.totalColumns,
              type: st.auditorium?.type,
            },
            format: formatKey,
            date: st.date,
            startTime: st.startTime,
          };
        });
      },
    }),

    checkMovieHasShowtimes: builder.query<{ hasShowtimes: boolean }, number>({
      query: (movieId: number) => `/movies/${movieId}/has-showtimes`,
    }),

    getMoviesShowtimesByCinema: builder.query<MovieWithShowtimesDto[], number>({
      query: cinemaId => `/cinemas/${cinemaId}/movies-showtimes`,
    }),
    getMoviesShowtimesByCinemaName: builder.query<
      MovieWithShowtimesDto[],
      string
    >({
      query: cinemaName =>
        `/cinemas/${cinemaName}/movies-showtimes-by-cinema-name`,
    }),
  }),
});

export const {
  useGetShowtimesByMovieQuery,
  useCheckMovieHasShowtimesQuery,
  useGetMoviesShowtimesByCinemaQuery,
  useGetMoviesShowtimesByCinemaNameQuery,
} = showtimeApi;
