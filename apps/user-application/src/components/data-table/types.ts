import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";

export type DataTableState = {
  sorting: SortingState;
  filters: ColumnFiltersState;
  pagination: PaginationState;
};

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowCount: number;
  state: DataTableState;
  onStateChange: (state: DataTableState) => void;
  isLoading: boolean;
  errorMessage: string | null;
  emptyMessage: string;
};
