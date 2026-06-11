import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { TodoDemo } from "@/components/todos/todo-demo";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export const Route = createFileRoute("/todos")({
  component: TodosPage,
});

function TodosPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link to="/" className="font-semibold">
          {t("app.name")}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-6 pb-20">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{t("todos.title")}</h1>
          <p className="text-muted-foreground">{t("todos.subtitle")}</p>
          <Badge variant="outline">{t("todos.mock")}</Badge>
        </div>
        <TodoDemo />
      </main>
    </div>
  );
}
