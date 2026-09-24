import {
  columnFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";

// Server-driven tables: sorting, filtering and pagination happen on the server
// (manual* options), so no client row models are registered.
export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
});

export type DataTableFeatures = typeof dataTableFeatures;
