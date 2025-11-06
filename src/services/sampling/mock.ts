import type { SamplingJob, SamplingJobFilters } from '@/types/sampling'

export async function mockFetchSamplingJobs(
  filters: SamplingJobFilters
): Promise<SamplingJob[]> {
  await new Promise((r) => setTimeout(r, 300))
  const base: SamplingJob[] = Array.from({ length: 18 }).map((_, i) => ({
    id: `job_${1000 + i}`,
    status: (['pending', 'running', 'success', 'failed'] as const)[i % 4],
    progress: [0, 20, 65, 100][i % 4],
    trigger_mode: i % 5 === 0 ? 'manual' : 'scheduled',
    schedule_cron: '0 3 * * *',
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    scheduled_at: new Date(Date.now() - i * 86400000 + 3600000).toISOString(),
    started_at: new Date(Date.now() - i * 86400000 + 5400000).toISOString(),
    finished_at:
      i % 4 === 2 || i % 4 === 3
        ? new Date(Date.now() - i * 86400000 + 7200000).toISOString()
        : undefined,
    summary:
      i % 4 === 2
        ? `抽样${100 + i}人，分析${200 + i * 3}个会话，生成${50 + i}份报告`
        : undefined,
    error_message: i % 4 === 3 ? '数据源连接超时，已自动重试 3 次' : undefined,
    stats: {
      sampled_users: 100 + i,
      analyzed_conversations: 200 + i * 3,
      generated_reports: 50 + i,
      errors: i % 4 === 3 ? 5 : 0,
    },
  }))

  let list = base
  if (filters.status !== 'all')
    list = list.filter((j) => j.status === filters.status)
  // dateRange 忽略，仅示意
  return list
}

export async function mockTriggerSamplingJob(): Promise<SamplingJob> {
  await new Promise((r) => setTimeout(r, 400))
  return {
    id: `job_${Math.floor(Math.random() * 10000)}`,
    status: 'pending',
    progress: 0,
    trigger_mode: 'manual',
    created_at: new Date().toISOString(),
    scheduled_at: new Date().toISOString(),
    stats: {
      sampled_users: 0,
      analyzed_conversations: 0,
      generated_reports: 0,
      errors: 0,
    },
  }
}
