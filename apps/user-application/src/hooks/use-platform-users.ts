import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { DataTableState } from "@/components/data-table/types";
import {
  DEFAULT_PLATFORM_LIST,
  platformUsersQuery,
  toListParams,
} from "@/core/queries/platform";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function usePlatformUsers() {
  const [state, setState] = useState<DataTableState>({
    sorting: [],
    filters: [],
    pagination: {
      pageIndex: DEFAULT_PLATFORM_LIST.pageIndex,
      pageSize: DEFAULT_PLATFORM_LIST.pageSize,
    },
  });
  const [search, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const query = useQuery({
    ...platformUsersQuery(toListParams(state.pagination, debouncedSearch)),
    placeholderData: keepPreviousData,
  });

  return {
    state,
    setState,
    search,
    setSearch: (value: string) => {
      setSearchValue(value);
      setState((s) => ({
        ...s,
        pagination: { ...s.pagination, pageIndex: 0 },
      }));
    },
    data: query.data?.rows ?? [],
    rowCount: query.data?.totalRowCount ?? 0,
    isLoading: query.isLoading,
    errorMessage: query.error ? "errors.loadFailed" : null,
  };
}
