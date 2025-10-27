// src/services/additionalService.api.ts
import { API_DOMAIN_PUBLIC } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface AdditionalService {
  id: number;
  name: string;
  description: string;
  thumbnail?: string;
  type: 'SINGLE' | 'COMBO';
  productId?: number;
  defaultQuantity?: number;
  status: boolean;
}

export interface AdditionalServiceItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    description?: string;
    thumbnail?: string;
    unit?: string;
  };
}

export interface AdditionalServicePrice {
  price: number;
  priceId: number;
}

export const additionalServiceApi = createApi({
  reducerPath: 'additionalServiceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_DOMAIN_PUBLIC,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: builder => ({
    // Lấy toàn bộ dịch vụ kèm theo (chỉ metadata)
    getAllAdditionalServices: builder.query<AdditionalService[], void>({
      query: () => `/additional-services`,
    }),

    // Lấy giá của một service
    getAdditionalServicePrice: builder.query<AdditionalServicePrice, number>({
      query: id => `/additional-services/${id}/price`,
    }),

    // Lấy các items trong combo service
    getAdditionalServiceItems: builder.query<AdditionalServiceItem[], number>({
      query: id => `/additional-services/${id}/items`,
    }),
  }),
});

export const {
  useGetAllAdditionalServicesQuery,
  useGetAdditionalServicePriceQuery,
  useLazyGetAdditionalServicePriceQuery,
  useGetAdditionalServiceItemsQuery,
} = additionalServiceApi;
