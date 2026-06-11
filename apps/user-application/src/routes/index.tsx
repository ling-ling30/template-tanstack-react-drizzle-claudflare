import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { t } = useTranslation();

  const features = [
    { title: t("features.authTitle"), body: t("features.authBody") },
    { title: t("features.dbTitle"), body: t("features.dbBody") },
    { title: t("features.i18nTitle"), body: t("features.i18nBody") },
    { title: t("features.edgeTitle"), body: t("features.edgeBody") },
    { title: t("features.jobsTitle"), body: t("features.jobsBody") },
    { title: t("features.dxTitle"), body: t("features.dxBody") },
  ];

  const steps = [
    t("landing.guideStep1"),
    t("landing.guideStep2"),
    t("landing.guideStep3"),
    t("landing.guideStep4"),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="font-semibold">{t("app.name")}</span>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link to="/showcase">{t("showcase.title")}</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/todos">{t("todos.title")}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/login">{t("nav.login")}</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        {/* Hero */}
        <section className="py-16 text-center sm:py-24">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            {t("landing.tagline")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("landing.subtitle")}
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link to="/dashboard">{t("landing.cta")}</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="py-8">
          <h2 className="mb-6 text-xl font-semibold">
            {t("landing.featuresTitle")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                  <CardDescription>{f.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Guide */}
        <section className="py-12">
          <h2 className="mb-6 text-xl font-semibold">
            {t("landing.guideTitle")}
          </h2>
          <Card>
            <CardContent className="pt-6">
              <ol className="list-decimal space-y-3 pl-5 text-sm">
                {steps.map((step) => (
                  <li key={step}>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {step}
                    </code>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-10 text-center text-sm text-muted-foreground">
        {t("app.name")}
      </footer>
    </div>
  );
}
