import { z } from "zod";

/** Operator form: how many organizations a user may create. */
export const organizationPolicyInputSchema = z.object({
  allowMultipleOrganizations: z.boolean(),
});

export type OrganizationPolicyInput = z.infer<
  typeof organizationPolicyInputSchema
>;
