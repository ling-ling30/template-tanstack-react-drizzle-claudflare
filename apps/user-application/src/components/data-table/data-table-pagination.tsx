import type { Table as ReactTable } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DataTablePagination<TData>({
  table,
  rowCount,
}: {
  table: ReactTable<TData>;
  rowCount: number;
}) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const firstRow = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, rowCount);

  return (
    <div className="flex flex-col gap-3 border-t px-3 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div>
        Baris {firstRow}-{lastRow} dari {rowCount}
      </div>
      <div className="flex items-center gap-2">
        <span>
          Halaman {pageCount === 0 ? 0 : pageIndex + 1} dari {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <Button
            aria-label="Halaman pertama"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            aria-label="Halaman sebelumnya"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            aria-label="Halaman berikutnya"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            aria-label="Halaman terakhir"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(Math.max(pageCount - 1, 0))}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
