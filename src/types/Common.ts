
import { ReactElement } from 'react';

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
