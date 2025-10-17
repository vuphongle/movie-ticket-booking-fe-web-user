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
  details: CouponDetailDto[];
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
    giftServiceId: number | null;
    lineDiscount: number;
    affectedQuantity: number;
  }[];
  gifts: any[];
}

// Request cho apply
export interface CouponApplyRequest {
  orderId: number;
  couponId: number;
  couponCode: string;
  cart: CouponPreviewRequest;
}

export interface CouponApplyRequestDisplay {
  orderId: number;
  couponId: number;
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

export interface CouponDetailDto {
  id: number;
  couponId: number;
  enabled: boolean;
  targetType: string;
  targetRefId: number | null;
  benefitType: string;
  percent: number | null;
  amount: number | null;
  giftServiceId: number | null;
  giftQuantity: number | null;
  lineMaxDiscount: number | null;
  minQuantity: number | null;
  limitQuantityApplied: number;
  minOrderTotal: number | null;
  detailUsagelimit: number | null;
  detailUsedCount: number;
  selectionStrategy: string | null;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
  terms: {
    id: number;
    percent?: number | null;
    amount?: number | null;
    giftServiceId?: number | null;
    giftQuantity?: number | null;
    limitQuantityApplied?: number;
  };
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
    getCouponByCode: builder.query<CouponDto, string>({
      // <-- Thêm API mới
      query: (code: string) => `coupons/coupon-by-code?code=${code}`,
    }),
    previewCoupon: builder.mutation<
      CouponPreviewResponse,
      { id: number; body: CouponPreviewRequest }
    >({
      query: ({ id, body }) => ({
        url: `coupons/${id}/preview`,
        method: 'POST',
        body,
      }),
    }),
    previewAllCouponDisplay: builder.mutation<
      CouponPreviewResponse,
      { body: CouponPreviewRequest }
    >({
      query: ({ body }) => ({
        url: `coupons/previews`,
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
    applyCouponDisplay: builder.mutation<
      CouponApplyResponse,
      CouponApplyRequestDisplay
    >({
      query: body => ({
        url: 'coupons/apply-display',
        method: 'POST',
        body,
      }),
    }),
    getAllCouponDetails: builder.query<CouponDetailDto[], void>({
      query: () => 'coupon-details',
    }),
  }),
});

export const {
  useGetAllCouponsQuery,
  useGetCouponByCodeQuery,
  usePreviewCouponMutation,
  usePreviewAllCouponDisplayMutation,
  useApplyCouponMutation,
  useApplyCouponDisplayMutation,
  useGetAllCouponDetailsQuery,
} = couponApi;
