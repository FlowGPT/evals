import { Button, Card, Descriptions, Divider, Empty, Progress, Space, Tag, Typography } from '@douyinfe/semi-ui'
import { IconArrowLeft } from '@douyinfe/semi-icons'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getContentAnalysisResultById } from '@/api/analysisResults'

export default function EngagementContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [record, setRecord] = useState<any | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!contentId) return
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const res = await getContentAnalysisResultById(contentId)
        if (cancelled) return
        if (!res?.success || !('data' in res) || !res.data) {
          setNotFound(true)
          setRecord(null)
        } else {
          setRecord(res.data)
          setNotFound(false)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [contentId])

  const stats = record?.statistics || {}
  const analysisData = record?.analysis_data || {}
  const engagement = analysisData?.engagement_result || {}
  const chatResults: any[] = analysisData?.chat_results || []
  const convResults: any[] = record?.conversation_session_results || []

  const avgQuality = Number(stats.avg_quality_index ?? 0)
  const avgProblemRate = Number(stats.avg_problem_rate ?? 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card bordered={false}
        title={<Typography.Title heading={5} style={{ margin: 0 }}>Engagement 内容详情 #{record?.id ?? contentId}</Typography.Title>}
        headerExtraContent={
          <Space>
            <Button icon={<IconArrowLeft />} onClick={() => navigate(-1)} type="tertiary">返回</Button>
          </Space>
        }
      >
        <Space wrap>
          <Tag color="blue">record #{record?.sampling_record_id ?? '-'}</Tag>
          <Tag color="purple">user {record?.user_id ?? '-'}</Tag>
          <Tag>{record?.created_at ? new Date(record.created_at).toLocaleString() : '-'}</Tag>
          {record?.updated_at && <Tag type="light">更新 {new Date(record.updated_at).toLocaleString()}</Tag>}
          <Tag type="solid" color="cyan">质量 {avgQuality.toFixed(2)}</Tag>
          <Tag color={avgProblemRate > 0.6 ? 'red' : avgProblemRate > 0.3 ? 'orange' : 'green'}>问题率 {(avgProblemRate * 100).toFixed(1)}%</Tag>
          {record?.analysis_status && <Tag type="solid" color="grey">{record.analysis_status}</Tag>}
          {record?.error_message && <Tag color="red">错误: {String(record.error_message)}</Tag>}
        </Space>
      </Card>

      <Card bordered={false} style={{ boxShadow: 'var(--semi-shadow-elevated)' }} loading={loading}>
        {notFound ? (
          <Empty description="未找到该内容分析记录 (404)" />
        ) : !record ? (
          <div style={{ height: 120 }} />
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {/* Engagement 概览 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(180deg, rgba(0,210,120,0.12), rgba(0,210,120,0.03))' }}>
                <Typography.Text type="tertiary">Engagement 概览</Typography.Text>
                <Divider margin="12px" />
                <Descriptions size="small" data={[
                  { key: '总会话', value: engagement?.statistics?.total_conversations ?? '-' },
                  { key: '总消息', value: engagement?.statistics?.total_chats ?? '-' },
                  { key: '时长(分钟)', value: engagement?.statistics?.duration_minutes ?? '-' },
                  { key: '平均会话质量', value: engagement?.statistics?.avg_session_quality ?? '-' },
                ]} />
                <Divider margin="12px" />
                <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>{engagement?.analysis_result?.summary || '(无摘要)'}</Typography.Paragraph>
                <Typography.Paragraph type="tertiary" style={{ whiteSpace: 'pre-wrap' }}>{engagement?.analysis_result?.stop_reason || ''}</Typography.Paragraph>
              </div>

              <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(180deg, rgba(80,140,255,0.12), rgba(80,140,255,0.03))', display: 'grid', gap: 12 }}>
                <Typography.Text type="tertiary">总体统计</Typography.Text>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag type="solid" color="blue" style={{ width: 120, textAlign: 'center' }}>质量均值</Tag>
                    <Progress percent={Math.round((avgQuality / 10) * 100)} showInfo format={() => `${avgQuality.toFixed(2)}/10`} style={{ width: 240 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag type="solid" color="orange" style={{ width: 120, textAlign: 'center' }}>问题率均值</Tag>
                    <Tag color={avgProblemRate > 0.6 ? 'red' : avgProblemRate > 0.3 ? 'orange' : 'green'}>{(avgProblemRate * 100).toFixed(1)}%</Tag>
                  </div>
                </div>
                <Divider margin="12px" />
                <Space wrap>
                  <Tag size="small" type="light">chats {stats?.total_chats_analyzed ?? 0}</Tag>
                  <Tag size="small" type="light">convs {stats?.total_conversations_analyzed ?? 0}</Tag>
                  <Tag size="small" type="light">tokens {engagement?.usage?.total_tokens ?? '-'}</Tag>
                </Space>
              </div>
            </div>

            {/* Chat 结果列表 */}
            <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(180deg, rgba(255,160,0,0.12), rgba(255,160,0,0.03))' }}>
              <Typography.Text type="tertiary">Chat 结果</Typography.Text>
              <Divider margin="12px" />
              {chatResults.length === 0 ? (
                <Typography.Text type="tertiary">暂无 chat 结果</Typography.Text>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {chatResults.map((c, idx) => {
                    const sc = c?.analysis_result?.scores || {}
                    const probs = c?.analysis_result?.problems || {}
                    const list = Object.entries(probs).filter(([, v]) => !!v).map(([k]) => k)
                    return (
                      <div key={idx} style={{ padding: 12, borderRadius: 10, background: 'var(--semi-color-bg-1)' }}>
                        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                          <Typography.Text strong>#{c.message_index}</Typography.Text>
                          <Typography.Text type="tertiary">{new Date(c.processed_at).toLocaleString()}</Typography.Text>
                        </Space>
                        <Divider margin="12px" />
                        <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>{c.message_content || '(空)'}</Typography.Paragraph>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {['relevance_score','consistency_score','immersion_score','progression_score','novelty_score','satisfaction_score'].map((k) => (
                            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Tag type="light" color="blue" style={{ width: 140, textAlign: 'center' }}>{labelOf(k)}</Tag>
                              <Progress percent={Math.round(((sc?.[k] ?? 0) / 10) * 100)} showInfo format={() => `${(sc?.[k] ?? 0).toFixed(1)}/10`} style={{ width: 220 }} />
                            </div>
                          ))}
                        </div>
                        <Divider margin="12px" />
                        <Space wrap>
                          <Tag type="solid" color="grey">tok {c?.usage?.total_tokens ?? '-'}</Tag>
                          {list.length === 0 ? (
                            <Tag color="green">无问题</Tag>
                          ) : (
                            list.map((p: string) => <Tag key={p} type="solid" color="orange">{p}</Tag>)
                          )}
                        </Space>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Conversation Sessions 概览 */}
            <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(180deg, rgba(140,110,255,0.12), rgba(140,110,255,0.03))' }}>
              <Typography.Text type="tertiary">Conversation Session 结果</Typography.Text>
              <Divider margin="12px" />
              {convResults.length === 0 ? (
                <Typography.Text type="tertiary">暂无会话结果</Typography.Text>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {convResults.map((s, i) => (
                    <div key={i} style={{ padding: 12, borderRadius: 10, background: 'var(--semi-color-bg-1)' }}>
                      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                        <Space>
                          <Tag type="solid" color="purple">Session #{s.conversation_session_id}</Tag>
                          <Tag type="light">{s.session_type}</Tag>
                        </Space>
                        <Typography.Text type="tertiary">{new Date(s.processed_at).toLocaleString()}</Typography.Text>
                      </Space>
                      <Divider margin="12px" />
                      <Space wrap>
                        <Tag size="small" type="light">chats {s.chat_stats?.total_chats ?? '-'}</Tag>
                        <Tag size="small" type="light">avgQ {s.chat_stats?.avg_chat_quality_index ?? '-'}</Tag>
                        <Tag size="small" type="light">first3 {s.chat_stats?.first_3_chat_quality_index ?? '-'}</Tag>
                        <Tag size="small" type="light">tok {s?.usage?.total_tokens ?? '-'}</Tag>
                      </Space>
                      <Divider margin="12px" />
                      <Descriptions size="small" data={[
                        { key: '摘要', value: <Typography.Paragraph ellipsis={{ rows: 2 }}>{s.analysis_result?.summary || ''}</Typography.Paragraph> },
                        { key: '意图', value: <Typography.Paragraph ellipsis={{ rows: 1 }}>{s.analysis_result?.intention || ''}</Typography.Paragraph> },
                        { key: '结束原因', value: <Typography.Paragraph ellipsis={{ rows: 1 }}>{s.analysis_result?.stop_reason || ''}</Typography.Paragraph> },
                      ]} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function labelOf(key: string) {
  switch (key) {
    case 'relevance_score': return '相关性'
    case 'consistency_score': return '一致性'
    case 'immersion_score': return '沉浸感'
    case 'progression_score': return '推进度'
    case 'novelty_score': return '新颖度'
    case 'satisfaction_score': return '满意度'
    default: return key
  }
}


