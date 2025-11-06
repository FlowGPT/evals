export interface EngagementSessionItem {
  engagement_id: string
  metadata: EngagementMetadata
  analysis_result: {
    summary: string
    stop_reason: string
  }
  stats_summary: {
    total_conversations: number
    avg_session_quality: number
    avg_problem_rate: number
  }
  processed_at: string
  usage: TokenUsage
}

export interface EngagementMetadata {
  conversation_session_count: number
  avg_conversation_session_length: number
  total_chat_count: number
  unique_bot_count: number
  duration_minutes: number
  last_conversation_session_id: number
  unique_model: string[]
  unique_chat_model: string[]
  user_id: string
  start_time: string
  end_time: string
}

export interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}
