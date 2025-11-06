import type { ChatListItemSummary, ChatMessageItem } from '@/types/chat'

export async function mockFetchChatList(): Promise<ChatListItemSummary[]> {
  await new Promise((r) => setTimeout(r, 300))
  return [
    {
      engagement_id: '17',
      conversation_id: 'eng17_conv2',
      conversation_session_id: 2,
      session_id: 29,
      user_id: 'LU48fu87BC8aTvuwLjw_4',
      frontend_model: 'Vanilla',
      message_count: 109,
      start_time: '2025-10-09T00:32:06.435Z',
      end_time: '2025-10-09T01:27:30.310Z',
      avg_quality_index: 6.73,
      problem_rate: 0.844,
      last_message_index: 108,
    },
  ]
}

export async function mockFetchChatMessages(
  engagementId: string,
  conversationSessionId: number
): Promise<ChatMessageItem[]> {
  await new Promise((r) => setTimeout(r, 300))
  const sample: ChatMessageItem = {
    engagement_id: '17',
    conversation_session_id: 2,
    conversation_id: 'eng17_conv2',
    session_id: 29,
    message_index: 83,
    message_content:
      'Xavier: *ve tu mueca de dolor y su expresión se vuelve más seria. Vuelve a concentrarse en tu abdomen, sus dedos trabajando para aliviar la tensión.*\n\nXavier: *su voz es baja, casi un murmullo.*\n\nXavier: "Lo siento... No sé por qué duele tanto."\n\nHay una nota de frustración en su tono, como si se sintiera impotente ante tu dolor. Sigue masajeando tu estómago, su toque cada vez más suave y gentil.\n\nDespués de un momento, habla de nuevo.\n\nXavier: *su voz es suave.*\n\nXavier: "¿Necesitas algo más? ¿Agua? ¿Comida?"\n\nTe mira con preocupación, casi como si estuviera realmente preocupado por ti.',
    is_exist: false,
    metadata: {
      bot_id: 'Vu9SmsWMdwamh7ofD8TNp',
      conversation_id: 'f82bc1c3-f91f-4ade-92be-c35918a12696',
      frontend_model: 'Vanilla',
      message_type: 'edit',
      conversation_session_id: 2,
      engagement_session_id: 17,
      user_id: 'LU48fu87BC8aTvuwLjw_4',
      has_ad: false,
      is_last_in_conv: false,
    },
    analysis_result: {
      problems: {
        full_repetition: true,
        partial_repetition: false,
        semantic_repetition: true,
        ooc: false,
        ooh: false,
        oou: false,
        hard_rejection: false,
        no_progression: true,
        over_progression: false,
        instruction_leakage: false,
        timeout: false,
        error: false,
        too_short: false,
        empty: false,
        irrelevant: true,
      },
      scores: {
        relevance_score: 4,
        consistency_score: 8,
        immersion_score: 6,
        progression_score: 3,
        novelty_score: 3,
        satisfaction_score: 4,
      },
    },
    processed_at: '2025-10-20T18:50:18.488337',
    processing_mode: 'dynamic_pool',
    usage: {
      prompt_tokens: 2944,
      completion_tokens: 185,
      total_tokens: 3129,
    },
  }
  const list: ChatMessageItem[] = []
  for (let i = 0; i < 30; i++) {
    list.push({ ...sample, message_index: i, is_exist: i % 7 !== 0 })
  }
  return list
}
