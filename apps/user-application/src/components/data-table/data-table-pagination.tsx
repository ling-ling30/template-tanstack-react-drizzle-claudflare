import type { Table as ReactTable } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function DataTablePagination<TData>({
  table,
  rowCount,
}: {
  table: ReactTable<TData>;
  rowCount: number;
}) {
  const { t } = useTranslation();
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const firstRow = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, rowCount);

  return (
    <div className="text-muted-foreground flex flex-col gap-3 border-t px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        {t("table.rows", { first: firstRow, last: lastRow, total: rowCount })}
      </div>
      <div className="flex items-center gap-2">
        <span>
          {t("table.page", {
            page: pageCount === 0 ? 0 : pageIndex + 1,
            total: pageCount,
          })}
        </span>
        <div className="flex items-center gap-1">
          <Button
            aria-label={t("table.firstPage")}
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            aria-label={t("table.previousPage")}
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            aria-label={t("table.nextPage")}
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            aria-label={t("table.lastPage")}
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
