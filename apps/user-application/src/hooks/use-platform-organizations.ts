import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DataTableState } from "@/components/data-table/types";
import type { PlatformOrganizationRow } from "@/components/platform/organizations/columns";
import { listPlatformOrganizationsFn } from "@/core/functions/platform-organizations";

export function usePlatformOrganizations() {
  const [state, setState] = useState<DataTableState>({
    sorting: [],
    filters: [],
    pagination: { pageIndex: 0, pageSize: 20 },
  });

  const query = useQuery({
    queryKey: ["platform", "organizations", state],
    queryFn: async (): Promise<{
      rows: PlatformOrganizationRow[];
      totalRowCount: number;
    }> =>
      listPlatformOrganizationsFn({
        data: {
          pageIndex: state.pagination.pageIndex,
          pageSize: state.pagination.pageSize,
        },
      }),
  });

  return {
    state,
    setState,
    data: query.data?.rows ?? [],
    rowCount: query.data?.totalRowCount ?? 0,
    isLoading: query.isLoading,
    errorMessage: query.error ? "errors.loadFailed" : null,
  };
}
