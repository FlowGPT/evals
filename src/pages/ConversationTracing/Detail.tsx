import { Button, Card, Descriptions, Divider, Empty, Progress, Space, Tag, Typography } from '@douyinfe/semi-ui'
import { IconArrowLeft } from '@douyinfe/semi-icons'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getConversationAnalysisResultById } from '@/api/analysisResults'

export default function ConversationDetailPage() {
  const { convId } = useParams<{ convId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [record, setRecord] = useState<any | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!convId) return
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const res = await getConversationAnalysisResultById(convId)
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
  }, [convId])

  const quality = Number(record?.avg_chat_quality_index ?? 0)
  const problemRate = Number(record?.problem_rate ?? 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card bordered={false}
        title={<Typography.Title heading={5} style={{ margin: 0 }}>Conversation 详情 #{record?.id ?? convId}</Typography.Title>}
        headerExtraContent={<Button icon={<IconArrowLeft />} onClick={() => navigate(-1)} type="tertiary">返回</Button>}
      >
        <Space wrap>
          <Tag color="purple">session #{record?.conversation_session_id ?? '-'}</Tag>
          <Tag type="light">{record?.session_type ?? '-'}</Tag>
          <Tag>{record?.processed_at ? new Date(record.processed_at).toLocaleString() : '-'}</Tag>
          <Tag type="solid" color="cyan">质量 {quality.toFixed(2)}</Tag>
          <Tag color={problemRate > 0.6 ? 'red' : problemRate > 0.3 ? 'orange' : 'green'}>问题率 {(problemRate * 100).toFixed(1)}%</Tag>
          <Tag type="light">first3 {record?.first_3_chat_quality_index ?? '-'}</Tag>
          <Tag type="light">{record?.total_chats ?? '-'} chats</Tag>
          <Tag type="light">tok {record?.usage?.total_tokens ?? '-'}</Tag>
        </Space>
      </Card>

      <Card bordered={false} style={{ boxShadow: 'var(--semi-shadow-elevated)' }} loading={loading}>
        {notFound ? (
          <Empty description="未找到该 Conversation 分析记录 (404)" />
        ) : !record ? (
          <div style={{ height: 120 }} />
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {/* 上方两列：质量/问题 + 指标 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(180deg, rgba(0,210,120,0.12), rgba(0,210,120,0.03))' }}>
                <Typography.Text type="tertiary">质量与问题</Typography.Text>
                <Divider margin="12px" />
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag type="solid" color="blue" style={{ width: 120, textAlign: 'center' }}>质量</Tag>
                    <Progress percent={Math.round((quality / 10) * 100)} showInfo format={() => `${quality.toFixed(2)}/10`} style={{ width: 240 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag type="solid" color="orange" style={{ width: 120, textAlign: 'center' }}>问题率</Tag>
                    <Tag color={problemRate > 0.6 ? 'red' : problemRate > 0.3 ? 'orange' : 'green'}>{(problemRate * 100).toFixed(1)}%</Tag>
                  </div>
                </div>
                <Divider margin="12px" />
                <Space wrap>
                  <Tag size="small" type="light">first3 {record.first_3_chat_quality_index ?? '-'}</Tag>
                  <Tag size="small" type="light">{record.total_chats ?? '-'} chats</Tag>
                  <Tag size="small" type="light">tok {record.usage?.total_tokens ?? '-'}</Tag>
                </Space>
              </div>

              <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(180deg, rgba(80,140,255,0.12), rgba(80,140,255,0.03))' }}>
                <Typography.Text type="tertiary">基本信息</Typography.Text>
                <Divider margin="12px" />
                <Descriptions size="small" data={[
                  { key: 'id', value: record.id },
                  { key: 'sampling_record_id', value: record.sampling_record_id },
                  { key: 'conversation_session_id', value: record.conversation_session_id },
                  { key: 'session_type', value: record.session_type },
                  { key: 'processed_at', value: new Date(record.processed_at).toLocaleString() },
                ]} />
              </div>
            </div>

            {/* 摘要与意图 */}
            <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(180deg, rgba(255,160,0,0.12), rgba(255,160,0,0.03))' }}>
              <Typography.Text type="tertiary">摘要/意图/结束原因</Typography.Text>
              <Divider margin="12px" />
              <Descriptions size="small" data={[
                { key: '摘要', value: <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>{record.analysis_result?.summary || ''}</Typography.Paragraph> },
                { key: '意图', value: <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>{record.analysis_result?.intention || ''}</Typography.Paragraph> },
                { key: '结束原因', value: <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>{record.analysis_result?.stop_reason || ''}</Typography.Paragraph> },
              ]} />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}


