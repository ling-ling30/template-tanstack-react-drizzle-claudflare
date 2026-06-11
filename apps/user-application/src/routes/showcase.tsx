/* eslint-disable i18next/no-literal-string --
   This is a component gallery: the literal labels below ("Default", "Secondary",
   etc.) intentionally name the UI variants being demonstrated, not user copy.
   Real app screens must still use t(). */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { TodoDemo } from "@/components/todos/todo-demo";
import { ThemeToggle } from "@/components/theme";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export const Route = createFileRoute("/showcase")({
  component: ShowcasePage,
});

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function ShowcasePage() {
  const { t } = useTranslation();

  const capabilities = [
    { title: t("features.authTitle"), body: t("features.authBody") },
    { title: t("features.dbTitle"), body: t("features.dbBody") },
    { title: t("features.i18nTitle"), body: t("features.i18nBody") },
    { title: t("features.edgeTitle"), body: t("features.edgeBody") },
    { title: t("features.jobsTitle"), body: t("features.jobsBody") },
    { title: t("features.dxTitle"), body: t("features.dxBody") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link to="/" className="font-semibold">
          {t("app.name")}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-12 px-6 pb-20">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("showcase.title")}
          </h1>
          <p className="text-muted-foreground">{t("showcase.subtitle")}</p>
        </div>

        {/* Capabilities (describe) */}
        <Section title={t("showcase.capabilitiesTitle")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c) => (
              <Card key={c.title}>
                <CardHeader>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <CardDescription>{c.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Section>

        {/* Components (live) */}
        <Section title={t("showcase.componentsTitle")}>
          <Card>
            <CardContent className="space-y-8 pt-6">
              {/* Buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("showcase.buttons")}</p>
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button size="sm">Small</Button>
                </div>
              </div>

              {/* Badges */}
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("showcase.badges")}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>

              {/* Alert */}
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("showcase.alert")}</p>
                <Alert>
                  <AlertTitle>{t("showcase.alertTitle")}</AlertTitle>
                  <AlertDescription>{t("showcase.alertBody")}</AlertDescription>
                </Alert>
              </div>

              {/* Interactive row */}
              <div className="flex flex-wrap items-end gap-6">
                {/* Dialog */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("showcase.dialog")}</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">{t("showcase.openDialog")}</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("showcase.dialogTitle")}</DialogTitle>
                        <DialogDescription>
                          {t("showcase.dialogBody")}
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Tooltip */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("showcase.tooltip")}</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline">
                          {t("showcase.tooltipHover")}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t("showcase.tooltipText")}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Select */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("showcase.select")}</p>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t("showcase.selectPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a">{t("showcase.optionA")}</SelectItem>
                      <SelectItem value="b">{t("showcase.optionB")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Checkbox */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("showcase.checkbox")}</p>
                  <div className="flex items-center gap-2">
                    <Checkbox id="agree" />
                    <Label htmlFor="agree">{t("showcase.checkboxLabel")}</Label>
                  </div>
                </div>

                {/* Toast */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("showcase.toast")}</p>
                  <Button
                    variant="outline"
                    onClick={() => toast.success(t("showcase.toastMessage"))}
                  >
                    {t("showcase.showToast")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Forms (live, mock todo) */}
        <Section title={t("showcase.formsTitle")}>
          <Card>
            <CardContent className="pt-6">
              <TodoDemo />
            </CardContent>
          </Card>
        </Section>

        {/* States (live) */}
        <Section title={t("showcase.statesTitle")}>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("showcase.skeleton")}</p>
              <SkeletonDemo />
            </div>
            <EmptyState
              icon={<Inbox className="size-6" />}
              title={t("showcase.emptyExampleTitle")}
              description={t("showcase.emptyExampleBody")}
            />
            <ErrorState
              title={t("showcase.errorExampleTitle")}
              description={t("showcase.errorExampleBody")}
            />
          </div>
        </Section>
      </main>
    </div>
  );
}

function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <div
      className="space-y-2 rounded-lg border p-4"
      onMouseEnter={() => setLoading(false)}
      onMouseLeave={() => setLoading(true)}
    >
      {loading ? (
        <>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">✓</p>
      )}
    </div>
  );
}
