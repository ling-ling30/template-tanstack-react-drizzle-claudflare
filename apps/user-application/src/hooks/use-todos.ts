import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listTodosFn,
  createTodoFn,
  toggleTodoFn,
  deleteTodoFn,
} from "@/core/functions/todos";

const TODOS_KEY = ["todos"] as const;

export function useTodos() {
  return useQuery({ queryKey: TODOS_KEY, queryFn: () => listTodosFn() });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTodoFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}

export function useToggleTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleTodoFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTodoFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}
