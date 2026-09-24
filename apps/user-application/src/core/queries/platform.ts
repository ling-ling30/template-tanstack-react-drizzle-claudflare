import { queryOptions } from "@tanstack/react-query";
import {
  getPlatformOrganizationFn,
  listPlatformOrganizationsFn,
} from "@/core/functions/platform-organizations";
import {
  getPlatformStatsFn,
  listPlatformUsersFn,
} from "@/core/functions/platform-users";

/**
 * Query options for the platform (super-admin) dashboard — one definition per
 * query, shared by route loaders (prefetch during SSR) and components
 * (`useQuery`), so both hit the same cache entry. Every key starts with
 * "platform" so a mutation can refresh them all with
 * `invalidateQueries({ queryKey: platformKeys.all })`.
 */
export const platformKeys = {
  all: ["platform"] as const,
  stats: () => [...platformKeys.all, "stats"] as const,
  organizations: (params: PlatformListParams) =>
    [...platformKeys.all, "organizations", params] as const,
  organization: (id: string) =>
    [...platformKeys.all, "organization", id] as const,
  users: (params: PlatformListParams) =>
    [...platformKeys.all, "users", params] as const,
};

export type PlatformListParams = {
  pageIndex: number;
  pageSize: number;
  search?: string;
};

/** First page, no search — what a list page shows on arrival. */
export const DEFAULT_PLATFORM_LIST: PlatformListParams = {
  pageIndex: 0,
  pageSize: 20,
};

export const platformStatsQuery = () =>
  queryOptions({
    queryKey: platformKeys.stats(),
    queryFn: () => getPlatformStatsFn(),
  });

export const platformOrganizationsQuery = (params: PlatformListParams) =>
  queryOptions({
    queryKey: platformKeys.organizations(params),
    queryFn: () => listPlatformOrganizationsFn({ data: params }),
  });

export const platformOrganizationQuery = (id: string) =>
  queryOptions({
    queryKey: platformKeys.organization(id),
    queryFn: () => getPlatformOrganizationFn({ data: id }),
  });

export const platformUsersQuery = (params: PlatformListParams) =>
  queryOptions({
    queryKey: platformKeys.users(params),
    queryFn: () => listPlatformUsersFn({ data: params }),
  });

/** Normalizes table state + search box into list params (and a stable cache key). */
export function toListParams(
  pagination: { pageIndex: number; pageSize: number },
  search: string
): PlatformListParams {
  const term = search.trim();
  return {
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    ...(term ? { search: term } : {}),
  };
}
