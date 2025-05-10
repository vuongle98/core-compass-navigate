import { ReactElement } from "react";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
}

export interface PageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Column<T> {
  header: string;
  accessorKey: string;
  id?: string;
  cell?: (item: T) => ReactElement | string | number | null;
  sortable?: boolean;
  filterable?: boolean;
}

export interface PaginatedData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  pageable?: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last?: boolean;
  numberOfElements?: number;
  first?: boolean;
  empty?: boolean;
  sort?: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
}

export interface PaginationOptions {
  page?: number;
  size?: number;
  sort?: string;
  [key: string]: unknown; // Allow arbitrary filter parameters
}

export interface Option<T> {
  value: string;
  label: React.ReactNode;
  original?: T;
  disabled?: boolean;
}

export type SearchResult = {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  url: string;
  type: string;
  permission?: string;
};

export interface FilterOption {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "search";
  placeholder?: string;
  options?: { value: string; label: string }[];
}
