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
        return response.map(st => ({
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
          format: `${formatGraphicLabel(st.graphicsType)}  ${st.translationType}`,
          date: st.date,
          startTime: st.startTime,
        }));
      },
    }),

    checkMovieHasShowtimes: builder.query<{ hasShowtimes: boolean }, number>({
      query: (movieId: number) => `/movies/${movieId}/has-showtimes`,
    }),
  }),
});

export const { useGetShowtimesByMovieQuery, useCheckMovieHasShowtimesQuery } =
  showtimeApi;
