import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Bug, Lightbulb, MessageSquare, Send, Loader2 } from "lucide-react";
import {
  feedbackInputSchema,
  type FeedbackInput,
} from "@repo/data-ops/zod-schema/feedback";
import { useSubmitFeedback } from "@/hooks/use-feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface FeedbackDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FeedbackDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: FeedbackDialogProps) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const submitFeedback = useSubmitFeedback();

  const getClientContext = () => {
    const pageUrl =
      typeof window !== "undefined" ? window.location.href : "unknown";
    const metadata =
      typeof window !== "undefined"
        ? JSON.stringify({
            userAgent: navigator.userAgent,
            language: navigator.language,
            screen: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
          })
        : undefined;
    return { pageUrl, metadata };
  };

  const form = useForm({
    defaultValues: {
      category: "bug",
      severity: "medium",
      title: "",
      description: "",
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
    } as FeedbackInput,
    validators: {
      onChange: feedbackInputSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { pageUrl, metadata } = getClientContext();
        await submitFeedback.mutateAsync({
          data: {
            ...value,
            pageUrl,
            metadata,
          },
        });
        toast.success(t("feedback.success"));
        form.reset();
        setOpen(false);
      } catch {
        toast.error(t("feedback.failed"));
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="surface-press gap-1.5 text-xs font-medium"
          >
            <Bug className="text-muted-foreground size-3.5" />
            <span>{t("feedback.trigger")}</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-md">
        <form
          method="post"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Bug className="text-primary size-5" />
              <span>{t("feedback.title")}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t("feedback.description")}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            {/* Category */}
            <form.Field
              name="category"
              children={(field) => {
                const currentVal = field.state.value;
                return (
                  <div className="space-y-1.5">
                    <FieldLabel className="text-xs font-semibold">
                      {t("feedback.categoryLabel")}
                    </FieldLabel>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => field.handleChange("bug")}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-[color,background-color,border-color,transform] duration-120 ease-out active:scale-[0.97] ${
                          currentVal === "bug"
                            ? "border-destructive bg-destructive/10 text-destructive"
                            : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        <Bug className="size-3.5" />
                        <span>{t("feedback.categoryBug")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => field.handleChange("feature")}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-[color,background-color,border-color,transform] duration-120 ease-out active:scale-[0.97] ${
                          currentVal === "feature"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        <Lightbulb className="size-3.5" />
                        <span>{t("feedback.categoryFeature")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => field.handleChange("general")}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-[color,background-color,border-color,transform] duration-120 ease-out active:scale-[0.97] ${
                          currentVal === "general"
                            ? "border-foreground bg-secondary text-foreground"
                            : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        <MessageSquare className="size-3.5" />
                        <span>{t("feedback.categoryGeneral")}</span>
                      </button>
                    </div>
                  </div>
                );
              }}
            />

            {/* Severity (only for bug category) */}
            <form.Subscribe
              selector={(state) => state.values.category}
              children={(category) => {
                if (category !== "bug") return null;
                return (
                  <form.Field
                    name="severity"
                    children={(field) => (
                      <div className="animate-in fade-in-0 slide-in-from-top-1 space-y-1.5 duration-150 ease-out motion-reduce:transition-none">
                        <FieldLabel className="text-xs font-semibold">
                          {t("feedback.severityLabel")}
                        </FieldLabel>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(["low", "medium", "high", "critical"] as const).map(
                            (sev) => (
                              <button
                                key={sev}
                                type="button"
                                onClick={() => field.handleChange(sev)}
                                className={`rounded-md border py-1 text-center font-mono text-[11px] capitalize transition-[color,background-color,border-color,transform] duration-120 ease-out active:scale-[0.97] ${
                                  field.state.value === sev
                                    ? "border-foreground bg-foreground text-background font-semibold"
                                    : "border-border text-muted-foreground hover:bg-muted/50"
                                }`}
                              >
                                {sev}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  />
                );
              }}
            />

            {/* Title */}
            <form.Field
              name="title"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="space-y-1.5">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-xs font-semibold"
                    >
                      {t("feedback.summaryLabel")}
                    </FieldLabel>
                    <form.Subscribe
                      selector={(state) => state.values.category}
                      children={(cat) => (
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder={
                            cat === "bug"
                              ? t("feedback.summaryPlaceholderBug")
                              : t("feedback.summaryPlaceholderFeature")
                          }
                          aria-invalid={isInvalid}
                          autoComplete="off"
                          className="text-xs"
                        />
                      )}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            {/* Description */}
            <form.Field
              name="description"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="space-y-1.5">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-xs font-semibold"
                    >
                      {t("feedback.detailsLabel")}
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={t("feedback.detailsPlaceholder")}
                      rows={4}
                      aria-invalid={isInvalid}
                      className="text-xs leading-relaxed"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs"
            >
              {t("actions.cancel")}
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  size="sm"
                  disabled={!canSubmit || isSubmitting}
                  className="gap-1.5 text-xs font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>{t("actions.submitting")}</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      <span>{t("feedback.submitBtn")}</span>
                    </>
                  )}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
