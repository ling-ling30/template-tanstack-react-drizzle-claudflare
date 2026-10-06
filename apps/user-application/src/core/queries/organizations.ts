import { queryOptions } from "@tanstack/react-query";
import { getOrganizationCreationStatusFn } from "@/core/functions/organizations";

/**
 * Query options for the signed-in user's own organization flows. Every key
 * starts with "organizations" so one `invalidateQueries({ queryKey:
 * organizationKeys.all })` refreshes them all (e.g. after creating one).
 */
export const organizationKeys = {
  all: ["organizations"] as const,
  creationStatus: () => [...organizationKeys.all, "creation-status"] as const,
};

/** Whether the platform's organization policy lets the user create another. */
export const organizationCreationStatusQuery = () =>
  queryOptions({
    queryKey: organizationKeys.creationStatus(),
    queryFn: () => getOrganizationCreationStatusFn(),
  });
