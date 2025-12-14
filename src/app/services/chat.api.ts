import { API_BASE_URL } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@app/Store';

export interface ChatRecommendationRequest {
  message: string;
  language?: string;
  conversationId?: string;
}

export interface RecommendedMovie {
  movieId: number;
  name: string;
  nameEn?: string | null;
  slug?: string | null;
  poster?: string | null;
  ageRating?: string | null;
  rating?: number | null;
  genres?: string[] | null;
  genreDisplayNames?: string[] | null;
  reasons?: string[] | null;
  showtimes?: RecommendedShowtime[] | null;
}

export interface RecommendedShowtime {
  id: number;
  date: number[] | string;
  startTime: string;
  endTime?: string | null;
  graphicsType?: string | null;
  translationType?: string | null;
  cinemaId?: number | null;
  cinemaName?: string | null;
  cinemaAddress?: string | null;
  auditoriumId?: number | null;
  auditoriumName?: string | null;
  auditoriumType?: string | null;
}

export interface ChatRecommendationResponse {
  conversationId: string;
  answer: string;
  recommendedMovies?: RecommendedMovie[];
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/v1`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: builder => ({
    getRecommendations: builder.mutation<
      ChatRecommendationResponse,
      ChatRecommendationRequest
    >({
      query: body => ({
        url: 'chat/recommendations',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetRecommendationsMutation } = chatApi;
