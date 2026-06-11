import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Check, Trash2 } from "lucide-react";
import { useTodos, useToggleTodo, useDeleteTodo } from "@/hooks/use-todos";
import { TodoForm } from "@/components/todos/todo-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";

function priorityVariant(p: "low" | "medium" | "high") {
  return p === "high" ? "destructive" : p === "medium" ? "default" : "secondary";
}

function priorityKey(p: "low" | "medium" | "high") {
  return `todos.priority${p.charAt(0).toUpperCase()}${p.slice(1)}` as
    | "todos.priorityLow"
    | "todos.priorityMedium"
    | "todos.priorityHigh";
}

/**
 * Self-contained todo demo: the form (TanStack Form + zod + shadcn Field) plus a
 * React-Query-backed list with loading / empty / error states. Backed by MOCK
 * in-memory server functions (`core/functions/todos.ts`).
 */
export function TodoDemo() {
  const { t } = useTranslation();
  const { data: todos, isLoading, isError } = useTodos();
  const toggle = useToggleTodo();
  const remove = useDeleteTodo();

  return (
    <div className="space-y-4">
      <TodoForm />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          title={t("todos.loadError")}
          description={t("common.errorRetry")}
        />
      ) : !todos || todos.length === 0 ? (
        <EmptyState title={t("todos.empty")} description={t("todos.emptyHint")} />
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <Button
                variant={todo.done ? "default" : "outline"}
                size="icon"
                aria-label={t("todos.markDone")}
                onClick={() => toggle.mutate({ data: todo.id })}
              >
                <Check className="size-4" />
              </Button>
              <span
                className={
                  todo.done
                    ? "flex-1 text-muted-foreground line-through"
                    : "flex-1"
                }
              >
                {todo.title}
              </span>
              <Badge variant={priorityVariant(todo.priority)}>
                {t(priorityKey(todo.priority))}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("todos.delete")}
                onClick={() => {
                  remove.mutate({ data: todo.id });
                  toast.success(t("todos.delete"));
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
