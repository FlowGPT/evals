import { apiFetch } from './client'

export type SamplingTaskStatus = 'pending' | 'ready' | 'running' | 'completed' | 'failed' | 'retry' | 'cancelled'

export type GetSamplingTasksParams = {
  status?: SamplingTaskStatus
  limit?: number // default 20
  offset?: number // default 0
}

export type SamplingTask = {
  id: number
  task_id: string
  user_id: string
  batch_id: string | null
  status: SamplingTaskStatus
  retry_count: number
  error_message: string | null
  sampling_record_id: number | null
  created_at: string
}

export async function getSamplingTasks(params: GetSamplingTasksParams): Promise<SamplingTask[]> {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.limit != null) search.set('limit', String(params.limit))
  if (params.offset != null) search.set('offset', String(params.offset))
  const qs = search.toString()
  const res = await apiFetch(`/api/sampling/tasks${qs ? `?${qs}` : ''}`)
  return res.json()
}

export type SamplingTaskLog = {
  id: number
  task_id: string
  user_id: string | null
  step: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  details: Record<string, any>
  created_at: string
}

export async function getSamplingTaskLogs(taskId: string, limit = 100, offset = 0): Promise<{ success: boolean; items: SamplingTaskLog[]; limit: number; offset: number }> {
  const search = new URLSearchParams()
  search.set('limit', String(limit))
  search.set('offset', String(offset))
  const res = await apiFetch(`/api/sampling/tasks/${encodeURIComponent(taskId)}/logs?${search.toString()}`)
  return res.json()
}

export async function cancelSamplingTask(taskId: string): Promise<{ success: boolean }> {
  const res = await apiFetch(`/api/sampling/tasks/${encodeURIComponent(taskId)}/cancel`, { method: 'POST' })
  return res.json()
}

export type CreateSamplingTaskPayload = {
  chat_date: string // YYYY-MM-DD
  limit: number
  priority: number
  task_user_id: string
}

export async function createSamplingTask(payload: CreateSamplingTaskPayload): Promise<{ success: boolean; task_id?: string }> {
  const res = await apiFetch(`/api/sampling/tasks/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}


