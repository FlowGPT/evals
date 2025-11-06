export interface ChatMessageItem {
  engagement_id: string
  conversation_session_id: number
  conversation_id: string
  session_id: number
  message_index: number
  message_content: string
  is_exist: boolean
  metadata: ChatMessageMetadata
  analysis_result: ChatAnalysisResult
  processed_at: string
  processing_mode: string
  usage: TokenUsage
}

export interface ChatMessageMetadata {
  bot_id: string
  conversation_id: string
  frontend_model: string
  message_type: 'user' | 'assistant' | 'system' | 'edit' | string
  conversation_session_id: number
  engagement_session_id: number
  user_id: string
  has_ad: boolean
  is_last_in_conv: boolean
}

export interface ChatAnalysisResult {
  problems: Record<string, boolean>
  scores: {
    relevance_score: number
    consistency_score: number
    immersion_score: number
    progression_score: number
    novelty_score: number
    satisfaction_score: number
  }
}

export interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface ChatListItemSummary {
  engagement_id: string
  conversation_id: string
  conversation_session_id: number
  session_id: number
  user_id: string
  frontend_model: string
  message_count: number
  start_time: string
  end_time: string
  avg_quality_index: number
  problem_rate: number
  last_message_index: number
}
