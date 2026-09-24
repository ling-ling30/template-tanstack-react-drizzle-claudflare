import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowData,
  SortingState,
} from "@tanstack/react-table";
import type { DataTableFeatures } from "./features";

export type DataTableState = {
  sorting: SortingState;
  filters: ColumnFiltersState;
  pagination: PaginationState;
};

export type DataTableProps<TData extends RowData> = {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  rowCount: number;
  state: DataTableState;
  onStateChange: (state: DataTableState) => void;
  isLoading: boolean;
  errorMessage: string | null;
  emptyMessage: string;
};
