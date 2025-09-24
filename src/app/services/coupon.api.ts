import { API_BASE_URL } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CouponDto {
  id: number;
  code: string;
  name: string;
  description: string;
  status: boolean;
  startDate: number;
  endDate: number;
  createdAt: number;
  updatedAt: number;
}

// Request cho preview
export interface CouponPreviewRequest {
  tickets: { seatTypeId: number; qty: number; unitPrice: number }[];
  services: { serviceId: number; qty: number; unitPrice: number }[];
}

export interface CouponPreviewResponse {
  totalDiscount: number;
  detailResults: {
    detailId: number;
    applied: boolean;
    reason: string;
    lineDiscount: number;
    affectedQuantity: number;
  }[];
  gifts: any[];
}

// Request cho apply
export interface CouponApplyRequest {
  orderId: number;
  couponCode: string;
  cart: CouponPreviewRequest;
}

export interface CouponApplyResponse {
  status: string;
  idempotentToken: string;
  appliedDetailIds: number[];
  previewResult: CouponPreviewResponse;
  errorMessage: string | null;
}

export const couponApi = createApi({
  reducerPath: 'couponApi',
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
    getAllCoupons: builder.query<CouponDto[], void>({
      query: () => 'coupons',
    }),
    getCouponByCode: builder.query<CouponDto, string>({ // <-- Thêm API mới
      query: (code: string) => `coupons/coupon-by-code?code=${code}`,
    }),
    previewCoupon: builder.mutation<CouponPreviewResponse, { id: number; body: CouponPreviewRequest }>({
      query: ({ id, body }) => ({
        url: `coupons/${id}/preview`,
        method: 'POST',
        body,
      }),
    }),
    applyCoupon: builder.mutation<CouponApplyResponse, CouponApplyRequest>({
      query: body => ({
        url: 'coupons/apply',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { 
  useGetAllCouponsQuery, 
  useGetCouponByCodeQuery,
  usePreviewCouponMutation, 
  useApplyCouponMutation 
} = couponApi;
