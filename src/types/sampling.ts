export type SamplingJobStatus = 'pending' | 'running' | 'success' | 'failed'

export interface SamplingJob {
  id: string
  status: SamplingJobStatus
  progress: number
  trigger_mode: 'manual' | 'scheduled'
  schedule_cron?: string
  created_at: string
  scheduled_at?: string
  started_at?: string
  finished_at?: string
  summary?: string
  error_message?: string
  stats: {
    sampled_users: number
    analyzed_conversations: number
    generated_reports: number
    errors: number
  }
}

export interface SamplingJobFilters {
  status: 'all' | SamplingJobStatus
  dateRange: [string, string] | null
}
