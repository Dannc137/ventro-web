import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { createTask, deleteTask, fetchTasks, updateTask } from "./api";
import type { CreateTaskRequest, UpdateTaskRequest } from "./types";

export function useTasks(eventId: string) {
  return useQuery({
    queryKey: queryKeys.tasks(eventId),
    queryFn: () => fetchTasks(eventId),
    enabled: Boolean(eventId),
  });
}

/** Refresh everything a task change can affect. */
function useTaskInvalidation(eventId: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks(eventId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(eventId) });
  };
}

export function useCreateTask(eventId: string) {
  const invalidate = useTaskInvalidation(eventId);

  return useMutation({
    mutationFn: (body: CreateTaskRequest) => createTask(eventId, body),
    onSuccess: invalidate,
  });
}

export function useUpdateTask(eventId: string) {
  const invalidate = useTaskInvalidation(eventId);

  return useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: UpdateTaskRequest }) =>
      updateTask(eventId, taskId, body),
    onSuccess: invalidate,
  });
}

export function useDeleteTask(eventId: string) {
  const invalidate = useTaskInvalidation(eventId);

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(eventId, taskId),
    onSuccess: invalidate,
  });
}