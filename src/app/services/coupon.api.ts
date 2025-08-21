import { API_DOMAIN_COUPON_PUBLIC } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CouponDto {
  id: number;
  code: string;
  discount: number;
  quantity: number;
  used: number;
  status: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export const couponApi = createApi({
  reducerPath: 'couponApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_DOMAIN_COUPON_PUBLIC,
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
    getAllCoupons: builder.query<CouponDto[], void>({
      query: () => '',
    }),
  }),
});

export const { useGetAllCouponsQuery } = couponApi;
