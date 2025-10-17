import { API_BASE_URL } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface OrderDto {
  id: number;
  movieTitle: string;
  cinema: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  seats: string[];
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'pending';
  createdAt: string;
  updatedAt: string;
}

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
      query: (id: number) => `orders/${id}`,
    }),
  }),
});


export const { useGetOrderByIdQuery, useGetAllOrdersQuery } = OrderApi;
