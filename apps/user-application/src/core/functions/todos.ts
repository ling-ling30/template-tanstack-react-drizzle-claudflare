import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * MOCK todos — demonstrates the form flow (server function + validation +
 * data fetching + toast) WITHOUT a database. Storage is an in-memory array on
 * the server isolate, so it resets on reload/redeploy. Swap these for real
 * `@repo/data-ops` queries + a `todos` table to make it persistent (see
 * docs/adding-a-feature.md).
 *
 * Follows the project form guide: client validates for fast feedback, the
 * server re-validates with the same zod schema.
 */
export const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  priority: z.enum(["low", "medium", "high"]),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;

export type Todo = CreateTodoInput & {
  id: string;
  done: boolean;
  createdAt: string;
};

// In-memory mock store (per server isolate).
const todos: Todo[] = [];

export const listTodosFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Todo[]> => {
    return [...todos].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
);

export const createTodoFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createTodoSchema.parse(data))
  .handler(async ({ data }): Promise<Todo> => {
    // Simulate latency so loading/submit states are visible.
    await new Promise((r) => setTimeout(r, 400));
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: data.title,
      priority: data.priority,
      done: false,
      createdAt: new Date().toISOString(),
    };
    todos.push(todo);
    return todo;
  });

export const toggleTodoFn = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().parse(id))
  .handler(async ({ data: id }): Promise<Todo | null> => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return null;
    todo.done = !todo.done;
    return todo;
  });

export const deleteTodoFn = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => z.string().parse(id))
  .handler(async ({ data: id }): Promise<{ id: string }> => {
    const idx = todos.findIndex((t) => t.id === id);
    if (idx >= 0) todos.splice(idx, 1);
    return { id };
  });
