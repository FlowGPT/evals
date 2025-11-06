import { apiFetch } from './client'

export type ProblemType =
  | 'ooc'
  | 'ooh'
  | 'oou'
  | 'empty'
  | 'error'
  | 'timeout'
  | 'too_short'
  | 'irrelevant'
  | 'hard_rejection'
  | 'no_progression'
  | 'full_repetition'
  | 'over_progression'
  | 'partial_repetition'
  | 'instruction_leakage'
  | 'semantic_repetition'

export type ChatAnalysisQuery = {
  page?: number
  page_size?: number
  conversation_id?: string
  message_id?: string
  sampling_record_id?: number
  has_problem?: boolean
  problem_types?: ProblemType[]
  processed_at_start?: string // ISO string (or 'YYYY-MM-DD')
  processed_at_end?: string
}

export type ChatAnalysisItem = {
  id: number
  sampling_record_id: number
  conversation_session_id: number
  conversation_id: string
  message_id: string
  message_index: number
  message_content: string
  is_exist: boolean
  analysis_result: {
    scores: Record<string, number>
    problems: Record<ProblemType, boolean>
  }
  quality_index: number | null
  has_problem: boolean
  problem_types: ProblemType[]
  usage?: {
    total_tokens: number
    prompt_tokens: number
    completion_tokens: number
  }
  processed_at: string
}

export type ChatAnalysisResponse = {
  success: boolean
  page: number
  page_size: number
  total: number
  total_pages: number
  items: ChatAnalysisItem[]
}

function toQuery(params: ChatAnalysisQuery): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    if (k === 'problem_types' && Array.isArray(v)) {
      if (v.length) search.set(k, v.join(','))
      return
    }
    search.set(k, String(v))
  })
  return search.toString()
}

export async function getChatAnalysisResults(params: ChatAnalysisQuery): Promise<ChatAnalysisResponse> {
  const qs = toQuery(params)
  const res = await apiFetch(`/api/analysis-results/chat${qs ? `?${qs}` : ''}`)
  return res.json()
}

export async function getChatAnalysisResultById(chatId: string | number): Promise<{ success: boolean; data?: ChatAnalysisItem } | { success: false }> {
  const res = await apiFetch(`/api/analysis-results/chat/${encodeURIComponent(String(chatId))}`)
  if (res.status === 404) {
    return { success: false }
  }
  return res.json()
}

// ---------- Content Analysis (per user) ----------
export type ContentAnalysisQuery = {
  page?: number
  page_size?: number
  user_id?: string
  sampling_record_id?: number
  created_at_start?: string // YYYY-MM-DD
  created_at_end?: string   // YYYY-MM-DD (server treats as [start, end+1))
}

export type ContentAnalysisItem = {
  sampling_record_id: number
  user_id: string
  analysis_data: Record<string, any>
  statistics: {
    avg_problem_rate: number
    avg_quality_index: number
    total_chats_analyzed: number
    total_conversations_analyzed: number
  }
  total_chats_analyzed: number
  total_conversations_analyzed: number
  avg_quality_index: number
  avg_problem_rate: number
  analysis_status: string
  created_at: string
}

export type ContentAnalysisResponse = {
  success: boolean
  page: number
  page_size: number
  total: number
  total_pages: number
  items: ContentAnalysisItem[]
}

export async function getContentAnalysisResults(params: ContentAnalysisQuery): Promise<ContentAnalysisResponse> {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.page_size) search.set('page_size', String(params.page_size))
  if (params.user_id) search.set('user_id', params.user_id)
  if (params.sampling_record_id) search.set('sampling_record_id', String(params.sampling_record_id))
  if (params.created_at_start) search.set('created_at_start', params.created_at_start)
  if (params.created_at_end) search.set('created_at_end', params.created_at_end)
  const qs = search.toString()
  const res = await apiFetch(`/api/analysis-results/content${qs ? `?${qs}` : ''}`)
  return res.json()
}

export async function getContentAnalysisResultById(contentId: string | number): Promise<{ success: boolean; data?: ContentAnalysisItem } | { success: false }> {
  const res = await apiFetch(`/api/analysis-results/content/${encodeURIComponent(String(contentId))}`)
  if (res.status === 404) return { success: false }
  return res.json()
}

// ---------- Conversation Analysis (per conversation session) ----------
export type ConversationAnalysisQuery = {
  page?: number
  page_size?: number
  sampling_record_id?: number
  processed_at_start?: string // ISO or YYYY-MM-DD
  processed_at_end?: string   // ISO or YYYY-MM-DD
}

export type ConversationAnalysisItem = {
  id: number
  sampling_record_id: number
  conversation_session_id: number
  session_type: string
  analysis_result: {
    summary?: string
    intention?: string
    stop_reason?: string
  }
  total_chats: number
  problem_rate: number
  avg_chat_quality_index: number
  first_3_chat_quality_index: number
  usage?: {
    total_tokens: number
    prompt_tokens: number
    completion_tokens: number
  }
  processed_at: string
}

export type ConversationAnalysisResponse = {
  success: boolean
  page: number
  page_size: number
  total: number
  total_pages: number
  items: ConversationAnalysisItem[]
}

export async function getConversationAnalysisResults(params: ConversationAnalysisQuery): Promise<ConversationAnalysisResponse> {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.page_size) search.set('page_size', String(params.page_size))
  if (params.sampling_record_id) search.set('sampling_record_id', String(params.sampling_record_id))
  if (params.processed_at_start) search.set('processed_at_start', params.processed_at_start)
  if (params.processed_at_end) search.set('processed_at_end', params.processed_at_end)
  const qs = search.toString()
  const res = await apiFetch(`/api/analysis-results/conversation${qs ? `?${qs}` : ''}`)
  return res.json()
}

export async function getConversationAnalysisResultById(convId: string | number): Promise<{ success: boolean; data?: ConversationAnalysisItem } | { success: false }> {
  const res = await apiFetch(`/api/analysis-results/conversation/${encodeURIComponent(String(convId))}`)
  if (res.status === 404) return { success: false }
  return res.json()
}


