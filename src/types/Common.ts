
import { ReactElement } from "react";

export interface Column<T> {
  header: string;
  accessorKey: string;
  id?: string;
  cell?: (item: T) => ReactElement | string | number | null; // Updated return type to include string and number
  sortable?: boolean;
  filterable?: boolean;
}

export interface PageResult<T> {
  content: T[];
  pageable: {
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
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: null | string;
}

export interface PageableRequest {
  page?: number;
  size?: number;
  sort?: string;
  [key: string]: any;
}
