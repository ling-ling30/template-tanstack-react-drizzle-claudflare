import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getSiteSettingsFn,
  updateSiteSettingsFn,
} from "@/core/functions/site-settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/settings")({
  // Prefetch settings so the pending skeleton shows during navigation.
  loader: async () => {
    await getSiteSettingsFn();
  },
  pendingComponent: SettingsSkeleton,
  component: SettingsPage,
});

function SettingsSkeleton() {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <Skeleton className="h-8 w-40 lg:col-span-2" />
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-80 w-full" />
    </section>
  );
}

function SettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettingsFn(),
  });

  const mutation = useMutation({
    mutationFn: updateSiteSettingsFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success(t("settings.saved"));
    },
    onError: () => toast.error(t("settings.saveError")),
  });

  const form = useForm({
    defaultValues: {
      siteName: settings?.siteName ?? "",
      ogTitle: settings?.ogTitle ?? "",
      ogDescription: settings?.ogDescription ?? "",
      ogImage: settings?.ogImage ?? "",
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        data: {
          siteName: value.siteName,
          ogTitle: value.ogTitle,
          ogDescription: value.ogDescription,
          ogImage: value.ogImage ? value.ogImage : null,
        },
      });
    },
  });

  // Populate the form once settings load from the server.
  useEffect(() => {
    if (settings) {
      form.reset({
        siteName: settings.siteName,
        ogTitle: settings.ogTitle,
        ogDescription: settings.ogDescription,
        ogImage: settings.ogImage ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-1 lg:col-span-2">
        <h1 className="text-2xl font-semibold">{t("settings.title")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.ogSection")}</CardTitle>
          <CardDescription>{t("settings.ogNote")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field name="siteName">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor={field.name}>{t("settings.siteName")}</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="ogTitle">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor={field.name}>{t("settings.ogTitle")}</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="ogDescription">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor={field.name}>
                    {t("settings.ogDescription")}
                  </Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="ogImage">
              {(field) => (
                <div className="space-y-1">
                  <Label htmlFor={field.name}>{t("settings.ogImage")}</Label>
                  <Input
                    id={field.name}
                    placeholder="https://…/og.png"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("settings.ogImageHint")}
                  </p>
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <SubmitButton disabled={!canSubmit} isSubmitting={isSubmitting}>
                  {t("settings.save")}
                </SubmitButton>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>

      {/* Live OG preview */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.preview")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form.Subscribe selector={(s) => s.values}>
            {(values) => (
              <div className="overflow-hidden rounded-lg border">
                {values.ogImage ? (
                  <img
                    src={values.ogImage}
                    alt=""
                    className="aspect-[1200/630] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[1200/630] w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                    {`${1200} × ${630}`}
                  </div>
                )}
                <div className="space-y-1 p-3">
                  <p className="text-sm font-medium">{values.ogTitle || "—"}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {values.ogDescription || "—"}
                  </p>
                </div>
              </div>
            )}
          </form.Subscribe>
        </CardContent>
      </Card>
    </section>
  );
}
