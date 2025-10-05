import { API_DOMAIN_PUBLIC } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type SeatKindBE = 'NORMAL' | 'VIP' | 'COUPLE';
export type ReservationStatus = 'BOOKED' | 'HELD' | 'CANCELLED';

export interface SeatDto {
  id: number;
  rowIndex: number;
  colIndex: number;
  code: string;
  type: SeatKindBE;
  status: boolean;
  reservationStatus: ReservationStatus;
  price: number;
}

/** --- API slice --- */
export const auditoriumApi = createApi({
  reducerPath: 'auditoriumApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_DOMAIN_PUBLIC,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
    responseHandler: async (response) => {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text as any;
      }
    },
  }),
  endpoints: (builder) => ({
    /** GET /auditoriums/{auditoriumId}/showtimes/{showtimeId}/seats */
    getSeatsByAuditoriumAndShowtime: builder.query<
      SeatDto[],
      { auditoriumId: number; showtimeId: number }
    >({
      query: ({ auditoriumId, showtimeId }) =>
        `/auditoriums/${auditoriumId}/showtimes/${showtimeId}/seats`,
    }),
  }),
});

export const { useGetSeatsByAuditoriumAndShowtimeQuery } = auditoriumApi;
