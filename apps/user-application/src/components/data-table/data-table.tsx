import {
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import type { DataTableProps } from "./types";

export function DataTable<TData, TValue>({
  columns,
  data,
  rowCount,
  state,
  onStateChange,
  isLoading,
  errorMessage,
  emptyMessage,
}: DataTableProps<TData, TValue>) {
  const pageCount = Math.ceil(rowCount / state.pagination.pageSize);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onColumnFiltersChange: (updater) =>
      onStateChange({
        ...state,
        filters: functionalUpdate(updater, state.filters),
        pagination: { ...state.pagination, pageIndex: 0 },
      }),
    onPaginationChange: (updater) =>
      onStateChange({
        ...state,
        pagination: functionalUpdate(updater, state.pagination),
      }),
    onSortingChange: (updater) =>
      onStateChange({
        ...state,
        sorting: functionalUpdate(updater, state.sorting),
        pagination: { ...state.pagination, pageIndex: 0 },
      }),
    pageCount,
    rowCount,
    state: {
      columnFilters: state.filters,
      pagination: state.pagination,
      sorting: state.sorting,
    },
  });

  return (
    <div className="overflow-hidden rounded-md border bg-background">
      {errorMessage ? (
        <Alert className="m-3" variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({
              length: Math.min(state.pagination.pageSize, 8),
            }).map((_, rowIndex) => (
              <TableRow key={`loading-${rowIndex}`}>
                {columns.map((column, columnIndex) => (
                  <TableCell key={`${String(column.id)}-${columnIndex}`}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} rowCount={rowCount} />
    </div>
  );
}
