import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FieldError } from "@/components/forms/field-error";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPlatformOrganizationFn } from "@/core/functions/platform-organizations";

export function OrganizationForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (value: { name: string; slug: string }) =>
      createPlatformOrganizationFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["platform", "organizations"],
      });
    },
  });

  const form = useForm({
    defaultValues: { name: "", slug: "" },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value);
        form.reset();
      } catch {
        toast.error(t("orgForm.saveFailed"));
      }
    },
  });

  return (
    <form
      className="grid gap-3 rounded-md border bg-card p-4 md:grid-cols-[1fr_1fr_auto]"
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
            !value ? t("orgForm.nameRequired") : undefined,
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
      <form.Field
        name="slug"
        validators={{
          onChange: ({ value }) =>
            /^[a-z0-9-]+$/.test(value)
              ? undefined
              : t("orgForm.slugInvalid"),
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{t("orgForm.slug")}</Label>
            <Input
              id={field.name}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder={t("orgForm.slugPlaceholder")}
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
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
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
