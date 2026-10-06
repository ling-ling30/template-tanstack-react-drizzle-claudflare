import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { updateOrganizationPolicyFn } from "@/core/functions/platform-settings";
import { organizationPolicyQuery, platformKeys } from "@/core/queries/platform";

/**
 * Operator setting: may a user create several organizations, or only one?
 * Saves on toggle and always shows the server's value (no optimistic update:
 * it is authoritative policy). Existing organizations are never touched.
 */
export function OrganizationPolicyCard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data } = useQuery(organizationPolicyQuery());

  const save = useMutation({
    mutationFn: updateOrganizationPolicyFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: platformKeys.organizationPolicy(),
      });
      toast.success(t("orgPolicy.saved"));
    },
    onError: () => toast.error(t("orgPolicy.saveError")),
  });

  if (!data) return <Skeleton className="h-40 w-full lg:col-span-2" />;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t("orgPolicy.title")}</CardTitle>
        <CardDescription>{t("orgPolicy.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Field orientation="horizontal">
          <Checkbox
            id="allowMultipleOrganizations"
            checked={data.allowMultipleOrganizations}
            disabled={save.isPending}
            onCheckedChange={(checked) =>
              save.mutate({ data: { allowMultipleOrganizations: !!checked } })
            }
          />
          <FieldContent>
            <FieldLabel htmlFor="allowMultipleOrganizations">
              {t("orgPolicy.allowMultiple")}
            </FieldLabel>
            <FieldDescription>
              {t("orgPolicy.allowMultipleHint")}
            </FieldDescription>
          </FieldContent>
        </Field>
      </CardContent>
    </Card>
  );
}
