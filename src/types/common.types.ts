// Global type definitions
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  status: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export type Theme = 'light' | 'dark';
export type Language = 'vi' | 'en';

// Re-export commonly used types from libraries
export type { ReactElement, ReactNode } from 'react';
export type { RouteObject } from 'react-router-dom';
