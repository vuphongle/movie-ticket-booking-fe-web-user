import { API_BASE_URL } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface MovieDto {
  id: number;
  name: string;
  nameEn?: string;
  poster?: string;
  trailer?: string;
  rating?: number;
  duration?: number;
  age?: string;
  releaseYear?: number;
}

export interface CinemaDto {
  id: number;
  name: string;
  address: string;
  mapLocation?: string;
}

export interface AuditoriumDto {
  id: number;
  name: string;
  type: string;
  cinema: CinemaDto;
}

export interface ShowtimeDto {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  translationType: string;
  graphicsType: string;
  auditorium: AuditoriumDto;
  movie: MovieDto;
}

export interface SeatDto {
  id: number;
  seatCode: string;
  row?: string;
  column?: number;
  code: string;
}

export interface TicketItemDto {
  id: number;
  seat: SeatDto;
  price: number;
}

export interface ServiceItemDto {
  id: number;
  additionalService: {
    id: number;
    name: string;
    price: number;
    thumbnail?: string;
  };
  quantity: number;
  price: number;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface OrderDto {
  id: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  totalPrice: number;
  discount: number;
  discountPrice: number;
  tempPrice: number;
  qrCodePath: string;

  showtime: ShowtimeDto;
  ticketItems: TicketItemDto[];
  serviceItems: ServiceItemDto[];
  user: UserDto;
  requestSnapshot: string;

  createdAt: string | number[];
  updatedAt: string | number[];
}

// ================== API ==================
export const OrderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
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
    getAllOrders: builder.query<OrderDto[], void>({
      query: () => `orders`,
    }),
    getOrderById: builder.query<OrderDto, number>({
      query: id => `orders/${id}`,
    }),
  }),
});

export const { useGetOrderByIdQuery, useGetAllOrdersQuery } = OrderApi;
