import { API_DOMAIN_PUBLIC, API_DOMAIN } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface UserDto {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface MovieDto {
  id: number;
  name: string;
  poster: string;
}

export interface ReviewDto {
  id: number;
  comment: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  images: string[];
  user?: UserDto;
  movie?: MovieDto;
  feeling?: string[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_DOMAIN,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: builder => ({
    getAllReviews: builder.query<
      Page<ReviewDto>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 6 }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        return `${API_DOMAIN_PUBLIC}/reviews?${params.toString()}`;
      },
    }),

    createReview: builder.mutation<ReviewDto, FormData>({
      query: formData => ({
        url: '/api/reviews',
        method: 'POST',
        body: formData,
      }),
    }),

    updateReview: builder.mutation<ReviewDto, FormData>({
      query: formData => ({
        url: '/api/reviews',
        method: 'PUT',
        body: formData,
      }),
    }),

    deleteReview: builder.mutation<void, number>({
      query: reviewId => ({
        url: `/api/reviews/${reviewId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetAllReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
