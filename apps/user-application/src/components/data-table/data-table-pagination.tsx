import type { RowData, Table as ReactTable } from "@tanstack/react-table";
import type { DataTableFeatures } from "./features";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DataTablePaginationProps<TData extends RowData = RowData> {
  table?: ReactTable<DataTableFeatures, TData>;
  rowCount: number;
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  canPreviousPage?: boolean;
  canNextPage?: boolean;
  className?: string;
}

export function DataTablePagination<TData extends RowData>({
  table,
  rowCount,
  pageIndex: manualPageIndex = 0,
  pageSize: manualPageSize = 10,
  pageCount: manualPageCount,
  onPageChange,
  canPreviousPage,
  canNextPage,
  className,
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation();

  const paginationState = table?.atoms?.pagination?.get();
  const pageIndex = table ? (paginationState?.pageIndex ?? 0) : manualPageIndex;
  const pageSize = table ? (paginationState?.pageSize ?? 10) : manualPageSize;
  const pageCount = table
    ? table.getPageCount()
    : (manualPageCount ?? (pageSize > 0 ? Math.ceil(rowCount / pageSize) : 0));

  const firstRow = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, rowCount);

  const canPrev = table
    ? table.getCanPreviousPage()
    : (canPreviousPage ?? pageIndex > 0);
  const canNext = table
    ? table.getCanNextPage()
    : (canNextPage ?? pageIndex + 1 < pageCount);

  const handleFirst = () => {
    if (table) table.setPageIndex(0);
    else onPageChange?.(0);
  };
  const handlePrev = () => {
    if (table) table.previousPage();
    else onPageChange?.(Math.max(0, pageIndex - 1));
  };
  const handleNext = () => {
    if (table) table.nextPage();
    else onPageChange?.(Math.min(pageCount - 1, pageIndex + 1));
  };
  const handleLast = () => {
    if (table) table.setPageIndex(Math.max(pageCount - 1, 0));
    else onPageChange?.(Math.max(pageCount - 1, 0));
  };

  return (
    <div
      data-slot="data-table-pagination"
      className={cn(
        "text-muted-foreground border-border/60 bg-muted/10 flex flex-col gap-3 border-t px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div>
        {t("table.rows", { first: firstRow, last: lastRow, total: rowCount })}
      </div>
      <div className="flex items-center gap-3">
        <span>
          {t("table.page", {
            page: pageCount === 0 ? 0 : pageIndex + 1,
            total: pageCount,
          })}
        </span>
        <div className="flex items-center gap-1">
          <Button
            aria-label={t("table.firstPage")}
            disabled={!canPrev}
            onClick={handleFirst}
            size="icon-sm"
            type="button"
            variant="outline"
            className="size-8"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            aria-label={t("table.previousPage")}
            disabled={!canPrev}
            onClick={handlePrev}
            size="icon-sm"
            type="button"
            variant="outline"
            className="size-8"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            aria-label={t("table.nextPage")}
            disabled={!canNext}
            onClick={handleNext}
            size="icon-sm"
            type="button"
            variant="outline"
            className="size-8"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            aria-label={t("table.lastPage")}
            disabled={!canNext}
            onClick={handleLast}
            size="icon-sm"
            type="button"
            variant="outline"
            className="size-8"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
