import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FieldError } from "@/components/forms/field-error";
import { SubmitButton } from "@/components/forms/submit-button";
import { organizationKeys } from "@/core/queries/organizations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

/** Better Auth's error code when the platform policy blocks creating one. */
const CREATE_NOT_ALLOWED = "YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION";

/**
 * Self-serve org creation. Better Auth makes the signed-in user the org's
 * `owner` member, so they pass `requireOrganizationContext` immediately.
 *
 * The user only names the org; its slug is a random UUID. Slugs appear in
 * workspace URLs (`/<slug>/dashboard`), so a UUID can't be guessed or enumerated and
 * never collides with another org's name.
 */
export function CreateOrganizationForm({
  onCreated,
}: {
  onCreated: (organization: { slug: string }) => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) => {
      const { data, error } = await authClient.organization.create({
        name: value.name.trim(),
        slug: crypto.randomUUID(),
      });
      if (error || !data) {
        // The platform policy can cap how many organizations one user creates.
        toast.error(
          error?.code === CREATE_NOT_ALLOWED
            ? t("orgForm.limitReached")
            : t("orgForm.saveFailed")
        );
        // The policy (or the user's count) may have changed; refresh the UI.
        await queryClient.invalidateQueries({ queryKey: organizationKeys.all });
        return;
      }
      form.reset();
      await queryClient.invalidateQueries({ queryKey: organizationKeys.all });
      onCreated({ slug: data.slug });
    },
  });

  return (
    <form
      method="post"
      className="bg-card grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) =>
            !value.trim() ? t("orgForm.nameRequired") : undefined,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{t("orgForm.name")}</Label>
            <Input
              id={field.name}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder={t("orgForm.namePlaceholder")}
              value={field.state.value}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            <FieldError
              message={
                field.state.meta.errors[0]
                  ? String(field.state.meta.errors[0])
                  : undefined
              }
            />
          </div>
        )}
      </form.Field>
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <SubmitButton
            className="self-start"
            disabled={!canSubmit}
            isSubmitting={isSubmitting}
          >
            {t("orgForm.create")}
          </SubmitButton>
        )}
      </form.Subscribe>
    </form>
  );
}
