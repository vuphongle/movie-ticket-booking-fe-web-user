import { API_BASE_URL } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { movieApi } from './movie.api';

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
  slug: string;
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

export interface MovieWithReviewsDto {
  id: number;
  name: string;
  slug: string;
  poster: string;
  reviews: ReviewDto[];
}

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Review'],
  endpoints: builder => ({
    getAllReviews: builder.query<
      Page<MovieWithReviewsDto>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 6 }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        return `/public/reviews?${params.toString()}`;
      },
      providesTags: ['Review'],
    }),

    createReview: builder.mutation<ReviewDto, FormData>({
      query: formData => ({
        url: '/reviews',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Review'],
      async onQueryStarted(formData, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          const movieId = Number(formData.get('movieId'));
          // Invalidate MovieDetail cache để refetch movie detail
          dispatch(
            movieApi.util.invalidateTags([{ type: 'MovieDetail', id: movieId }])
          );
        } catch {}
      },
    }),

    updateReview: builder.mutation<ReviewDto, FormData>({
      query: formData => ({
        url: '/reviews',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Review'],
      async onQueryStarted(formData, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          const movieId = Number(formData.get('movieId'));
          // Invalidate MovieDetail cache để refetch movie detail
          dispatch(
            movieApi.util.invalidateTags([{ type: 'MovieDetail', id: movieId }])
          );
        } catch {}
      },
    }),

    deleteReview: builder.mutation<void, { reviewId: number; movieId: number }>({
      query: ({ reviewId }) => ({
        url: `/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review'],
      async onQueryStarted({ movieId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate MovieDetail cache để refetch movie detail
          dispatch(
            movieApi.util.invalidateTags([{ type: 'MovieDetail', id: movieId }])
          );
        } catch {}
      },
    }),
  }),
});

export const {
  useGetAllReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
