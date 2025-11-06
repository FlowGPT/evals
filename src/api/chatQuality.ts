import { apiFetch } from './client'

export type TypeKey =
  | 'full_repetition'
  | 'partial_repetition'
  | 'semantic_repetition'
  | 'ooc'
  | 'ooh'
  | 'oou'
  | 'hard_rejection'
  | 'no_progression'
  | 'over_progression'
  | 'instruction_leakage'
  | 'timeout'
  | 'error'
  | 'too_short'
  | 'empty'
  | 'irrelevant'

export type DailyStats = {
  stat_date: string
  total_chats?: number
  problem_chats?: number
  overall_error_rate?: number
  type_counts?: Partial<Record<TypeKey, number>>
  type_rates: Partial<Record<TypeKey, number>>
  created_at?: string
}

export type ChatQualityRangeResponse = {
  success: boolean
  data: DailyStats[]
}

export async function getChatQualityStatsRange(startDate: string, endDate: string): Promise<ChatQualityRangeResponse> {
  const url = `/api/chat-quality-stats/range?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`
  const res = await apiFetch(url)
  return res.json()
}


