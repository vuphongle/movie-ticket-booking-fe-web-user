import { API_BASE_URL } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface SeatReservationRequest {
  seatId: number;
  showtimeId: number;
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
  endpoints: (builder) => ({
    /** POST /api/seat-reservations/book */
    bookSeat: builder.mutation<void, SeatReservationRequest>({
      query: (body) => ({
        url: `/seat-reservations/book`,
        method: 'POST',
        body,
      }),
    }),
    /** POST /api/seat-reservations/cancel */
    cancelSeat: builder.mutation<void, SeatReservationRequest>({
      query: (body) => ({
        url: `/seat-reservations/cancel`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useBookSeatMutation, useCancelSeatMutation } = reservationApi;
