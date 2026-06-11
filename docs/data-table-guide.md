# Data Table Guide

The shared `DataTable` (`components/data-table/data-table.tsx`) renders a paginated,
sortable, filterable table on top of [TanStack Table](https://tanstack.com/table). It
handles loading, empty, and error states for you. Reference implementation:
`routes/platform/organizations.tsx` + `components/platform/organizations/columns.tsx`.

## Props

```ts
type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];   // TanStack column defs
  data: TData[];                          // current page rows
  rowCount: number;                       // total rows (for pagination)
  state: DataTableState;                  // sorting / filters / pagination
  onStateChange: (state: DataTableState) => void;
  isLoading: boolean;
  errorMessage: string | null;           // already-translated message, or null
  emptyMessage: string;                  // already-translated empty text
};
```

## 1. Define columns

Keep columns presentational. Translate any header/label with `t(...)` — pass the translated
string in (columns are plain data, so resolve `t` where you build them, or translate the
header via a small wrapper component).

```tsx
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type ThingRow = { id: string; name: string; status: "active" | "disabled" };

export const thingColumns: ColumnDef<ThingRow>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "active" ? "default" : "secondary"}>
        {row.original.status}
      </Badge>
    ),
  },
];
```

## 2. Fetch via a hook

Server-side pagination/sorting: hold `DataTableState` in the hook and pass it to the server
function so the DB does the work. See `hooks/use-platform-organizations.ts`.

```ts
export function useThings() {
  const [state, setState] = useState<DataTableState>({
    sorting: [],
    filters: [],
    pagination: { pageIndex: 0, pageSize: 20 },
  });
  const query = useQuery({
    queryKey: ["things", state],
    queryFn: () => listThingsFn({ data: { ...state } }),
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
```

## 3. Render

```tsx
function ThingsPage() {
  const { t } = useTranslation();
  const table = useThings();
  return (
    <DataTable
      columns={thingColumns}
      data={table.data}
      rowCount={table.rowCount}
      state={table.state}
      onStateChange={table.setState}
      isLoading={table.isLoading}
      errorMessage={table.errorMessage ? t(table.errorMessage) : null}
      emptyMessage={t("common.emptyTitle")}
    />
  );
}
```

## Rules

- **No hardcoded strings** in columns or table props — translate headers, status labels,
  empty/error messages with `t(...)`.
- Do pagination/sorting **server-side** for large lists (push `state` into the query).
- Keep the column `cell` renderers presentational; no data fetching inside them.
