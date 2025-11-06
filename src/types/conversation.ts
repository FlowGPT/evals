export interface ConversationSessionItem {
  engagement_id: string
  conversation_id: string
  session_id: string
  engagement_session_id: string
  conversation_session_id: string
  metadata: ConversationMetadata
  analysis_result: ConversationAnalysisResult
  chat_stats: ChatStats
  processed_at: string
  usage: TokenUsage
}

export interface ConversationMetadata {
  session_length: number
  session_type: 'new_bot' | 'continue' | string
  is_last_in_engagement: boolean
  regen_rate: number
  edit_rate: number
  continue_rate: number
  autoreply_rate: number
  delete_rate: number
  edit_delete_rate: number
  resend_rate: number
  type_rate: number
  bot_id: string
  conversation_id: string
  conversation_session_id: number
  engagement_session_id: number
  user_id: string
  start_time: string
  end_time: string
}

export interface ConversationAnalysisResult {
  scores: ConversationScores
  analysis: {
    summary: string
    intention: string
    stop_reason: string
  }
}

export interface ConversationScores {
  relevance_score: number
  consistency_score: number
  immersion_score: number
  progression_score: number
  novelty_score: number
  satisfaction_score: number
  avg_chat_quality_index: number
  first_3_chat_quality_index: number
}

export interface ChatStats {
  total_chats: number
  problem_rate: number
  avg_quality_index: number
  problem_distribution: Record<string, number>
}

export interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}
