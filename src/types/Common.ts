export interface Column<T> {
  header: string;
  accessorKey: string;
  id?: string;
  cell?: (item: T) => JSX.Element;
  sortable?: boolean;
  filterable?: boolean;
}
