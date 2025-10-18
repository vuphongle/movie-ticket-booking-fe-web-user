import { API_BASE_URL } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface SeatReservationRequest {
  seatId: number;
  showtimeId: number;
}

export interface SeatStatusResponse {
  seatId: number;
  showtimeId: number;
  status: string | null;
}

export interface CancelMultipleSeatsRequest {
  showtimeId: number;
  seatIds: number[];
}

export const reservationApi = createApi({
  reducerPath: 'reservationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: builder => ({
    /** POST /api/seat-reservations/book */
    bookSeat: builder.mutation<void, SeatReservationRequest>({
      query: body => ({
        url: `/seat-reservations/book`,
        method: 'POST',
        body,
      }),
    }),
    /** POST /api/seat-reservations/cancel */
    cancelSeat: builder.mutation<void, SeatReservationRequest>({
      query: body => ({
        url: `/seat-reservations/cancel`,
        method: 'POST',
        body,
      }),
    }),
    /** POST /api/seat-reservations/cancel-multi */
    cancelSeatMulti: builder.mutation<void, CancelMultipleSeatsRequest>({
      query: body => ({
        url: `/seat-reservations/cancel-multiple`,
        method: 'POST',
        body,
      }),
    }),
    checkSeatStatus: builder.query<SeatStatusResponse, SeatReservationRequest>({
      query: ({ seatId, showtimeId }) => ({
        url: `/seats/status?seatId=${seatId}&showtimeId=${showtimeId}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useBookSeatMutation,
  useCancelSeatMutation,
  useLazyCheckSeatStatusQuery,
  useCancelSeatMultiMutation,
} = reservationApi;
