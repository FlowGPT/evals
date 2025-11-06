import type { EngagementSessionItem } from '@/types/engagement'

export async function mockFetchEngagementSessions(): Promise<
  EngagementSessionItem[]
> {
  await new Promise((r) => setTimeout(r, 300))

  const sample: EngagementSessionItem = {
    engagement_id: '21',
    metadata: {
      conversation_session_count: 1,
      avg_conversation_session_length: 10.0,
      total_chat_count: 10,
      unique_bot_count: 1,
      duration_minutes: 3.33,
      last_conversation_session_id: 5,
      unique_model: [
        'Nitral-AI/Captain-Eris_Violet-V0.420-12B-High-0124-175token',
        'Nitral-AI/Captain-Eris_Violet-V0.420-12B-High-0124-225token',
        'Nitral-AI/Captain-Eris_Violet-V0.420-12B-High-0124-150token',
        'Nitral-AI/Captain-Eris_Violet-V0.420-12B-High-0124-250token-continue',
        'Nitral-AI/Captain-Eris_Violet-V0.420-12B-High-0124-250token',
      ],
      unique_chat_model: ['Vanilla'],
      user_id: 'LU48fu87BC8aTvuwLjw_4',
      start_time: '2025-10-10 07:15:06',
      end_time: '2025-10-10 07:18:26',
    },
    analysis_result: {
      summary:
        '在本engagement中，用户总计经历了7个session，包括1个conversation session，共发送了10条聊天消息，总时长为3分钟。对话的平均质量分数为6.78（满分10分），表明整体互动体验中等偏上。行为模式显示，用户互动方式以探索为主，频繁查看prompt卡片……',
      stop_reason:
        '用户可能因AI回复中的高重复率而流失，semantic_repetition高达60%，partial/ full重复也较高，整体沉浸感下降。',
    },
    stats_summary: {
      total_conversations: 1,
      avg_session_quality: 6.78,
      avg_problem_rate: 0.7,
    },
    processed_at: '2025-10-20T19:17:50.538510',
    usage: {
      prompt_tokens: 2721,
      completion_tokens: 841,
      total_tokens: 3562,
    },
  }

  return [sample]
}
