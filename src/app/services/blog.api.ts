import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_DOMAIN_PUBLIC, API_DOMAIN } from '@lib/api';

// -----------------------------
// Định nghĩa kiểu dữ liệu
// -----------------------------
export interface BlogDto {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  type?: string;
  views?: number;
  content?: string;
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

// -----------------------------
// Cấu hình API Slice
// -----------------------------
export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_DOMAIN_PUBLIC,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
    responseHandler: async (response) => {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return {};
      }
    },
  }),
  endpoints: (builder) => ({
    getAllBlogs: builder.query<Page<BlogDto>, { type?: string; page?: number; limit?: number }>({
      query: ({ type, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        return `blogs?${params.toString()}`;
      },
      transformResponse: (response: Page<BlogDto>) => ({
        ...response,
        content: response.content.map((item) => ({
          ...item,
          thumbnail: item.thumbnail.startsWith('/api')
            ? `${API_DOMAIN}${item.thumbnail}`
            : item.thumbnail,
        })),
      }),
    }),

    getLatestBlogs: builder.query<Page<BlogDto>, { type?: string; page?: number; limit?: number }>({
      query: ({ type, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        return `blogs/latest?${params.toString()}`;
      },
      transformResponse: (response: Page<BlogDto>) => ({
        ...response,
        content: response.content.map((item) => ({
          ...item,
          thumbnail: item.thumbnail.startsWith('/api')
            ? `${API_DOMAIN}${item.thumbnail}`
            : item.thumbnail,
        })),
      }),
    }),

    loadMoreBlogs: builder.query<Page<BlogDto>, { type?: string; page?: number; limit?: number }>({
      query: ({ type, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        return `blogs/load-more?${params.toString()}`;
      },
      transformResponse: (response: Page<BlogDto>) => ({
        ...response,
        content: response.content.map((item) => ({
          ...item,
          thumbnail: item.thumbnail.startsWith('/api')
            ? `${API_DOMAIN}${item.thumbnail}`
            : item.thumbnail,
        })),
      }),
    }),

    getBlogDetail: builder.query<BlogDto, { id: number; slug: string }>({
      query: ({ id, slug }) => `blogs/${id}/${slug}`,
      transformResponse: (response: BlogDto) => ({
        ...response,
        thumbnail: response.thumbnail.startsWith('/api')
          ? `${API_DOMAIN}${response.thumbnail}`
          : response.thumbnail,
      }),
    }),

    getMostViewBlogs: builder.query<BlogDto[], { type?: string; limit?: number }>({
      query: ({ type, limit = 5 }) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        params.append('limit', limit.toString());
        return `blogs/most-view?${params.toString()}`;
      },
      transformResponse: (response: BlogDto[]) =>
        response.map((item) => ({
          ...item,
          thumbnail: item.thumbnail.startsWith('/api')
            ? `${API_DOMAIN}${item.thumbnail}`
            : item.thumbnail,
        })),
    }),

    getRecommendBlogs: builder.query<BlogDto[], { id: number; limit?: number }>({
      query: ({ id, limit = 5 }) => `blogs/${id}/recommend?limit=${limit}`,
      transformResponse: (response: BlogDto[]) =>
        response.map((item) => ({
          ...item,
          thumbnail: item.thumbnail.startsWith('/api')
            ? `${API_DOMAIN}${item.thumbnail}`
            : item.thumbnail,
        })),
    }),
  }),
});

export const {
  useGetAllBlogsQuery,
  useGetLatestBlogsQuery,
  useLoadMoreBlogsQuery,
  useGetBlogDetailQuery,
  useGetMostViewBlogsQuery,
  useGetRecommendBlogsQuery,
  useLazyGetAllBlogsQuery,
  useLazyLoadMoreBlogsQuery,
} = blogApi;
