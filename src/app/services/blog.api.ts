import { API_DOMAIN_BLOG_PUBLIC } from '@lib/api';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface BlogDto {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
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

export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_DOMAIN_BLOG_PUBLIC,
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
    getAllBlogs: builder.query<
      Page<BlogDto>,
      { type?: string; page?: number; limit?: number }
    >({
      query: ({ type, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        return `?${params.toString()}`;
      },
    }),

    getLatestBlogs: builder.query<
      Page<BlogDto>,
      { type?: string; page?: number; limit?: number }
    >({
      query: ({ type, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        return `/latest?${params.toString()}`;
      },
    }),

    getMostViewBlogs: builder.query<
      Page<BlogDto>,
      { type?: string; limit?: number }
    >({
      query: ({ type, limit = 5 }) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        params.append('limit', limit.toString());
        return `/most-view?${params.toString()}`;
      },
    }),
  }),
});

export const {
  useGetAllBlogsQuery,
  useGetLatestBlogsQuery,
  useGetMostViewBlogsQuery,
} = blogApi;
