import type { ConversationSessionItem } from '@/types/conversation'

export async function mockFetchConversationSessions(): Promise<
  ConversationSessionItem[]
> {
  await new Promise((r) => setTimeout(r, 300))

  const sample: ConversationSessionItem = {
    engagement_id: '17',
    conversation_id: 'eng17_conv2',
    session_id: '2',
    engagement_session_id: '17',
    conversation_session_id: '2',
    metadata: {
      session_length: 111,
      session_type: 'new_bot',
      is_last_in_engagement: true,
      regen_rate: 0.0,
      edit_rate: 100.0,
      continue_rate: 0.0,
      autoreply_rate: 0.0,
      delete_rate: 0.0,
      edit_delete_rate: 0.0,
      resend_rate: 0.0,
      type_rate: 0.0,
      bot_id: 'Vu9SmsWMdwamh7ofD8TNp',
      conversation_id: 'f82bc1c3-f91f-4ade-92be-c35918a12696',
      conversation_session_id: 2,
      engagement_session_id: 17,
      user_id: 'LU48fu87BC8aTvuwLjw_4',
      start_time: '2025-10-09T00:32:06.435Z',
      end_time: '2025-10-09T01:27:30.310Z',
    },
    analysis_result: {
      scores: {
        relevance_score: 7.5,
        consistency_score: 7.0,
        immersion_score: 8.0,
        progression_score: 7.5,
        novelty_score: 7.0,
        satisfaction_score: 7.5,
        avg_chat_quality_index: 6.73,
        first_3_chat_quality_index: 6.89,
      },
      analysis: {
        summary:
          '对话围绕用户角色在家庭中经历月经痛，哥哥们提供关怀和安慰，逐步发展至亲密互动，最终以陪伴休息结束。',
        intention:
          '探索角色扮演中的家庭关爱与亲密关系，通过编辑消息反复调整细节。',
        stop_reason: '重复较多，编辑率高；达到剧情高潮后结束或转向其他会话。',
      },
    },
    chat_stats: {
      total_chats: 109,
      problem_rate: 0.844,
      avg_quality_index: 6.73,
      problem_distribution: {
        full_repetition: 15,
        semantic_repetition: 81,
        no_progression: 6,
        irrelevant: 14,
        partial_repetition: 69,
        ooc: 20,
        ooh: 11,
        over_progression: 8,
        oou: 7,
      } as any,
    },
    processed_at: '2025-10-20T19:15:59.829177',
    usage: {
      prompt_tokens: 21993,
      completion_tokens: 649,
      total_tokens: 22642,
    },
  }

  return [sample]
}
