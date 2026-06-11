import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createTodoSchema } from "@/core/functions/todos";
import { useCreateTodo } from "@/hooks/use-todos";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/forms/submit-button";

/**
 * Create-todo form, built per the shadcn TanStack Form pattern
 * (https://ui.shadcn.com/docs/forms/tanstack-form):
 *  - validate with the shared zod schema (client) — the server re-validates;
 *  - `isInvalid = isTouched && !isValid` so changing one field doesn't flash an
 *    error on an untouched one;
 *  - `<FieldError errors={field.state.meta.errors} />` (the component renders the
 *    zod issue messages — no manual error stringifying);
 *  - `data-invalid` on <Field>, `aria-invalid` on the control;
 *  - reset only after a SUCCESSFUL create.
 */
export function TodoForm() {
  const { t } = useTranslation();
  const createTodo = useCreateTodo();

  const form = useForm({
    defaultValues: {
      title: "",
      priority: "medium" as "low" | "medium" | "high",
    },
    validators: { onChange: createTodoSchema },
    onSubmit: async ({ value }) => {
      try {
        await createTodo.mutateAsync({ data: value });
        toast.success(t("todos.added"));
        form.reset();
      } catch {
        toast.error(t("todos.addError"));
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup className="flex-col gap-4 sm:flex-row sm:items-end">
        <form.Field
          name="title"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="flex-1">
                <FieldLabel htmlFor={field.name}>
                  {t("todos.titleLabel")}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("todos.titlePlaceholder")}
                  aria-invalid={isInvalid}
                  autoComplete="off"
                />
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            );
          }}
        />

        <form.Field
          name="priority"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field
                data-invalid={isInvalid}
                orientation="responsive"
                className="sm:w-44"
              >
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>
                    {t("todos.priority")}
                  </FieldLabel>
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </FieldContent>
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(v) =>
                    field.handleChange(v as "low" | "medium" | "high")
                  }
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("todos.priorityLow")}</SelectItem>
                    <SelectItem value="medium">
                      {t("todos.priorityMedium")}
                    </SelectItem>
                    <SelectItem value="high">
                      {t("todos.priorityHigh")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            );
          }}
        />

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <SubmitButton disabled={!canSubmit} isSubmitting={isSubmitting}>
              {t("todos.add")}
            </SubmitButton>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
