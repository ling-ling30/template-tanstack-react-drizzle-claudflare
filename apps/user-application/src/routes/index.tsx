/* eslint-disable i18next/no-literal-string --
   Technical badges, task labels, and step markers are technical demonstrations. */
import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Database,
  Globe,
  Zap,
  Cpu,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Terminal,
  CheckCircle2,
  Circle,
  Calendar,
  Layers,
  Check,
  Filter,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

interface InteractiveTask {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: "High" | "Medium" | "Normal";
  status: "Completed" | "In Progress" | "On Track";
  completed: boolean;
}

function LandingPage() {
  const { t } = useTranslation();

  const [tasks, setTasks] = React.useState<InteractiveTask[]>([
    {
      id: "task-1",
      title: "Harden multi-tenant RBAC & org boundaries",
      assignee: "Security",
      dueDate: "Today",
      priority: "High",
      status: "Completed",
      completed: true,
    },
    {
      id: "task-2",
      title: "Deploy Cloudflare D1 distributed edge database",
      assignee: "Platform",
      dueDate: "Tomorrow",
      priority: "High",
      status: "On Track",
      completed: false,
    },
    {
      id: "task-3",
      title: "Activate direct-to-R2 presigned media pipeline",
      assignee: "Storage",
      dueDate: "Sep 28",
      priority: "Medium",
      status: "In Progress",
      completed: false,
    },
    {
      id: "task-4",
      title: "Configure Asana design tokens & @shadcn/lint rules",
      assignee: "Design",
      dueDate: "Done",
      priority: "Normal",
      status: "Completed",
      completed: true,
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              status: !t.completed ? "Completed" : "In Progress",
            }
          : t
      )
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  const features = [
    {
      title: t("features.authTitle"),
      body: t("features.authBody"),
      icon: ShieldCheck,
      badge: "01",
    },
    {
      title: t("features.dbTitle"),
      body: t("features.dbBody"),
      icon: Database,
      badge: "02",
    },
    {
      title: t("features.i18nTitle"),
      body: t("features.i18nBody"),
      icon: Globe,
      badge: "03",
    },
    {
      title: t("features.edgeTitle"),
      body: t("features.edgeBody"),
      icon: Zap,
      badge: "04",
    },
    {
      title: t("features.jobsTitle"),
      body: t("features.jobsBody"),
      icon: Cpu,
      badge: "05",
    },
    {
      title: t("features.dxTitle"),
      body: t("features.dxBody"),
      icon: Sparkles,
      badge: "06",
    },
  ];

  const steps = [
    t("landing.guideStep1"),
    t("landing.guideStep2"),
    t("landing.guideStep3"),
    t("landing.guideStep4"),
  ];

  return (
    <div className="bg-background text-foreground selection:bg-destructive/15 min-h-screen antialiased">
      {/* Asana Translucent Frosted Glass Navbar */}
      <header className="asana-glass border-border sticky top-0 z-50 w-full border-b transition-colors">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 sm:px-8">
          <Link
            to="/"
            className="text-foreground asana-press flex items-center gap-2.5 font-medium tracking-tight transition-opacity hover:opacity-85"
          >
            {/* Asana Iconic 3-Dot / Coral Energy Mark */}
            <div className="bg-foreground text-background flex size-7 items-center justify-center rounded-md shadow-xs">
              <span className="bg-destructive inline-block size-2 rounded-full" />
            </div>
            <span className="text-sm font-semibold tracking-tight sm:text-base">
              {t("app.name")}
            </span>
          </Link>

          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/showcase">{t("showcase.title")}</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/todos">{t("todos.title")}</Link>
            </Button>

            <div className="bg-border mx-1 hidden h-4 w-px sm:block" />

            <LanguageSwitcher />
            <ThemeToggle />

            <Button asChild size="sm">
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pt-12 pb-24 sm:px-8 sm:pt-20 sm:pb-32">
        {/* Subtle Ambient Asana Coral Glow */}
        <div className="asana-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-96" />

        {/* Hero Section */}
        <section className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <Badge variant="outline">
              <span className="bg-destructive inline-block size-2 animate-pulse rounded-full" />
              <span>Asana Productivity Design System</span>
              <ChevronRight className="text-muted-foreground size-3" />
            </Badge>
          </div>

          <h1 className="display-title mx-auto text-4xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {t("landing.tagline")}
          </h1>

          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-relaxed font-normal sm:text-xl">
            {t("landing.subtitle")}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/dashboard" className="gap-2">
                {t("landing.cta")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link to="/showcase">{t("showcase.title")}</Link>
            </Button>
          </div>
        </section>

        {/* Asana Work Management Stage Preview */}
        <section className="mt-16 sm:mt-24">
          <div className="border-border bg-card asana-card-shadow overflow-hidden rounded-lg border">
            {/* Asana Workspace Header */}
            <div className="border-border bg-secondary/50 flex flex-col justify-between gap-3 border-b px-5 py-3.5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
                  <Layers className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tracking-tight">
                      Cloudflare Worker Sprint
                    </span>
                    <Badge variant="success">On Track</Badge>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {completedCount} of {tasks.length} tasks completed
                  </div>
                </div>
              </div>

              {/* View Switcher Tabs & Filter */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <div className="border-border bg-background flex items-center rounded-md border p-0.5 text-xs font-medium">
                  <span className="bg-secondary text-foreground rounded-sm px-2.5 py-1 shadow-xs">
                    List
                  </span>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer px-2.5 py-1">
                    Board
                  </span>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer px-2.5 py-1">
                    Timeline
                  </span>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Filter className="size-3" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Asana Interactive Task Rows */}
            <div className="divide-border bg-card divide-y">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="hover:bg-secondary/40 group flex cursor-pointer items-center justify-between gap-3 px-5 py-3 transition-colors select-none"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      aria-label="Toggle task completion"
                      className="border-border asana-check hover:border-destructive flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-all"
                      style={{
                        backgroundColor: task.completed
                          ? "var(--destructive)"
                          : "transparent",
                        borderColor: task.completed
                          ? "var(--destructive)"
                          : undefined,
                      }}
                    >
                      {task.completed ? (
                        <Check className="text-destructive-foreground size-3 stroke-2" />
                      ) : (
                        <Circle className="size-3 text-transparent" />
                      )}
                    </button>
                    <span
                      className={`truncate text-sm tracking-tight transition-all ${
                        task.completed
                          ? "text-muted-foreground line-through"
                          : "text-foreground font-medium"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-muted-foreground hidden text-xs sm:inline-flex">
                      {task.assignee}
                    </span>
                    <Badge
                      variant={
                        task.status === "Completed"
                          ? "success"
                          : task.priority === "High"
                            ? "coral"
                            : "secondary"
                      }
                    >
                      {task.status}
                    </Badge>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Calendar className="size-3" />
                      <span>{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Asana Bottom Telemetry Bar */}
            <div className="divide-border border-border bg-secondary/30 grid grid-cols-1 divide-y border-t sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="flex items-center gap-3 p-4">
                <div className="bg-chart-2/10 text-chart-2 flex size-8 items-center justify-center rounded-md">
                  <Zap className="size-4" />
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">
                    Edge Latency
                  </div>
                  <div className="text-sm font-semibold tracking-tight">
                    &lt; 15ms global TTFB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4">
                <div className="bg-chart-3/10 text-chart-3 flex size-8 items-center justify-center rounded-md">
                  <Database className="size-4" />
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">
                    Data Storage
                  </div>
                  <div className="text-sm font-semibold tracking-tight">
                    Cloudflare D1 &amp; R2
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4">
                <div className="bg-destructive/10 text-destructive flex size-8 items-center justify-center rounded-md">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">
                    Design System
                  </div>
                  <div className="text-sm font-semibold tracking-tight">
                    @shadcn/lint Enforced
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid (Strict 4px/8px Geometry) */}
        <section className="mt-24 sm:mt-32">
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <h2 className="section-title text-2xl font-semibold tracking-tight sm:text-4xl">
              {t("landing.featuresTitle")}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="group relative overflow-hidden">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground flex size-9 items-center justify-center rounded-md transition-colors">
                        <Icon className="size-4.5" />
                      </div>
                      <span className="text-muted-foreground font-mono text-xs">
                        {f.badge}
                      </span>
                    </div>
                    <CardTitle>{f.title}</CardTitle>
                    <CardDescription>{f.body}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Step-by-Step Developer Workflow */}
        <section className="mt-24 sm:mt-32">
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <h2 className="section-title text-2xl font-semibold tracking-tight sm:text-4xl">
              {t("landing.guideTitle")}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, idx) => (
              <div
                key={step}
                className="border-border bg-card asana-card-shadow hover:bg-card flex items-start gap-3.5 rounded-lg border p-5 transition-all"
              >
                <div className="bg-secondary text-foreground flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs">
                    <Terminal className="size-3.5" />
                    <span>Step {idx + 1}</span>
                  </div>
                  <p className="text-foreground bg-secondary/50 border-border/60 mt-2 rounded-md border p-2.5 font-mono text-xs leading-relaxed select-all">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Asana Minimalist Footer */}
      <footer className="border-border bg-card border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <span className="bg-destructive inline-block size-2 rounded-full" />
            <span className="text-foreground font-medium">{t("app.name")}</span>
            <span className="text-muted-foreground/60">
              — Built on TanStack &amp; Cloudflare
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/showcase"
              className="hover:text-foreground transition-colors"
            >
              {t("showcase.title")}
            </Link>
            <Link
              to="/todos"
              className="hover:text-foreground transition-colors"
            >
              {t("todos.title")}
            </Link>
            <Link
              to="/login"
              className="hover:text-foreground transition-colors"
            >
              {t("nav.login")}
            </Link>
            <Link
              to="/dashboard"
              className="hover:text-foreground transition-colors"
            >
              {t("nav.dashboard")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
