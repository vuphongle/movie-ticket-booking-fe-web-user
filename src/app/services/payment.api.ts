import { API_BASE_URL } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface TicketItem {
  seatId: number;
  price: number;
}

export interface ServiceItem {
  additionalServiceId: number;
  quantity: number;
  price: number;
}

export interface CouponGift {
  serviceId: number;
  serviceName: string;
  quantity: number;
  thumbnail?: string;
}

export interface CouponItem {
  detailId: number;
  code: string;
  discount: number;
  type: string;
  gifts?: CouponGift[];
}

export interface DiscountsInfo {
  totalDiscount: number;
  coupons: CouponItem[];
}

export interface CreateOrderRequest {
  showtimeId: number;
  ticketItems: TicketItem[];
  serviceItems?: ServiceItem[];
  discounts?: DiscountsInfo;
  paymentMethod?: string;
  expireSeconds?: number;
}

export interface PaymentResponse {
  url: string;
}

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    /** POST /api/orders */
    createOrder: builder.mutation<PaymentResponse, CreateOrderRequest>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useCreateOrderMutation } = paymentApi;
