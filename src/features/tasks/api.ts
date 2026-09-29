import { api } from "@/lib/api-client"
import type {
  CreateTaskRequest,
  TaskBucket,
  TaskView,
  UpdateTaskRequest,
} from "./types"

export async function fetchTasks(eventId: string): Promise<TaskBucket[]> {
  const { data } = await api.get<TaskBucket[]>(`/events/${eventId}/tasks`)
  return data
}

export async function createTask(
  eventId: string,
  body: CreateTaskRequest
): Promise<TaskView> {
  const { data } = await api.post<TaskView>(`/events/${eventId}/tasks`, body)
  return data
}

export async function updateTask(
  eventId: string,
  taskId: string,
  body: UpdateTaskRequest
): Promise<TaskView> {
  const { data } = await api.patch<TaskView>(
    `/events/${eventId}/tasks/${taskId}`,
    body
  )
  return data
}

export async function deleteTask(
  eventId: string,
  taskId: string
): Promise<void> {
  await api.delete(`/events/${eventId}/tasks/${taskId}`)
}
