import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { DataTableState } from "@/components/data-table/types";
import { updatePlatformOrganizationStatusFn } from "@/core/functions/platform-organizations";
import {
  DEFAULT_PLATFORM_LIST,
  platformKeys,
  platformOrganizationsQuery,
  toListParams,
} from "@/core/queries/platform";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function usePlatformOrganizations() {
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
    ...platformOrganizationsQuery(
      toListParams(state.pagination, debouncedSearch)
    ),
    // Keep showing the current page while the next page / search loads.
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

/** Disable / re-enable an org, then refresh every platform query. */
export function useToggleOrganizationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; status: "active" | "disabled" }) =>
      updatePlatformOrganizationStatusFn({ data: input }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: platformKeys.all }),
  });
}
