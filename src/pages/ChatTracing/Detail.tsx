import { Button, Card, Descriptions, Divider, Empty, Progress, Space, Tag, Typography } from '@douyinfe/semi-ui'
import { IconArrowLeft } from '@douyinfe/semi-icons'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getChatAnalysisResultById } from '@/api/analysisResults'

export function ChatTracingDetailPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [record, setRecord] = useState<any | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!chatId) return
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const res = await getChatAnalysisResultById(chatId)
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
  }, [chatId])

  const scores = record?.analysis_result?.scores || {}
  const problems = record?.analysis_result?.problems || {}
  const problemList = Object.entries(problems).filter(([, v]) => !!v).map(([k]) => k)
  const allProblemKeys = Array.from(new Set([...(problemList || []), ...((record?.problem_types as string[]) || [])]))
  const quality = record?.quality_index ?? null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card bordered={false}
        title={<Typography.Title heading={5} style={{ margin: 0 }}>Chat 详情 #{record?.id ?? chatId}</Typography.Title>}
        headerExtraContent={
          <Space>
            <Button icon={<IconArrowLeft />} onClick={() => navigate(-1)} type="tertiary">返回</Button>
          </Space>
        }
      >
        <Space wrap>
          <Tag color="blue">record #{record?.sampling_record_id ?? '-'}</Tag>
          <Tag color="purple">session #{record?.conversation_session_id ?? '-'}</Tag>
          <Tag>{new Date(record?.processed_at ?? Date.now()).toLocaleString()}</Tag>
          <Tag color={allProblemKeys.length ? 'red' : 'green'}>{allProblemKeys.length ? `问题 ${allProblemKeys.length}` : '无问题'}</Tag>
        </Space>
      </Card>

      <Card bordered={false} style={{ boxShadow: 'var(--semi-shadow-elevated)' }} loading={loading}>
        {notFound ? (
          <Empty description="未找到该 Chat 分析记录 (404)" />
        ) : !record ? (
          <div style={{ height: 120 }} />
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {/* 顶部概览 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(180deg, rgba(80,140,255,0.12), rgba(80,140,255,0.03))' }}>
                <Typography.Text type="tertiary">消息内容</Typography.Text>
                <Divider margin="12px" />
                <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.6 }}>{record.message_content || '(空)'}</Typography.Paragraph>
                <Descriptions size="small" data={[
                  { key: 'message_id', value: record.message_id ?? '-' },
                  { key: 'message_index', value: record.message_index ?? '-' },
                  { key: 'conversation_id', value: record.conversation_id ?? '-' },
                ]} />
              </div>

              <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(180deg, rgba(0,210,120,0.12), rgba(0,210,120,0.03))', display: 'grid', gap: 12 }}>
                <Typography.Text type="tertiary">评分概览</Typography.Text>
                <div style={{ display: 'grid', gap: 10 }}>
                  {['relevance_score', 'consistency_score', 'immersion_score', 'progression_score', 'novelty_score', 'satisfaction_score'].map((k) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag type="solid" color="blue" style={{ width: 140, textAlign: 'center' }}>{labelOf(k)}</Tag>
                      <Progress percent={Math.round(((scores?.[k] ?? 0) / 10) * 100)} showInfo format={() => `${(scores?.[k] ?? 0).toFixed(1)}/10`} style={{ width: 220 }} />
                    </div>
                  ))}
                </div>
                <Divider margin="12px" />
                <Space wrap>
                  <Tag type="solid" color="cyan">质量 {quality == null ? '-' : Number(quality).toFixed(2)}</Tag>
                  <Tag type="solid" color="grey">Tokens {record?.usage?.total_tokens ?? '-'}</Tag>
                  <Tag type="light" color="grey">prompt {record?.usage?.prompt_tokens ?? '-'}</Tag>
                  <Tag type="light" color="grey">completion {record?.usage?.completion_tokens ?? '-'}</Tag>
                </Space>
              </div>
            </div>

            {/* 问题标注 */}
            <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(180deg, rgba(255,160,0,0.12), rgba(255,160,0,0.03))' }}>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Typography.Text type="tertiary">问题标注</Typography.Text>
                <Tag color={allProblemKeys.length ? 'red' : 'green'}>{allProblemKeys.length ? '存在问题' : '无问题'}</Tag>
              </Space>
              <Divider margin="12px" />
              {allProblemKeys.length === 0 ? (
                <Typography.Text type="tertiary">未检测到问题类型</Typography.Text>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {allProblemKeys.map((p) => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Tag type="solid" color="orange" style={{ minWidth: 160, textAlign: 'center' }}>{p}</Tag>
                      <Typography.Text style={{ fontSize: 12 }}>{problemDescOf(p)}</Typography.Text>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 元数据 */}
            <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(180deg, rgba(140,110,255,0.12), rgba(140,110,255,0.03))' }}>
              <Typography.Text type="tertiary">元数据</Typography.Text>
              <Divider margin="12px" />
              <Descriptions size="small" data={[
                { key: 'id', value: record.id },
                { key: 'sampling_record_id', value: record.sampling_record_id },
                { key: 'conversation_session_id', value: record.conversation_session_id },
                { key: 'processed_at', value: new Date(record.processed_at).toLocaleString() },
                { key: 'is_exist', value: String(record.is_exist) },
                { key: 'has_problem', value: String(record.has_problem) },
                { key: 'problem_types', value: (record.problem_types || []).join(', ') || '-' },
              ]} />
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

function problemDescOf(key: string) {
  const map: Record<string, string> = {
    full_repetition: '与上下文中某段输出完全一模一样',
    partial_repetition: '与上下文中某段输出有明显的部分重复内容',
    semantic_repetition: '与上下文中某段内容语义高度相似或重复',
    ooc: '明显违背角色设定(性格、身份、特征、态度等)',
    ooh: '与已建立的事实(剧情、场景、事件等)产生明显矛盾',
    oou: '与用户既定设定(关系、称谓、状态、身份等)不符',
    hard_rejection: '突然跳出角色，以系统身份进行硬性拒绝或审查提醒',
    no_progression: '完全没有推进剧情或对话，仅有无意义的动作描述或内心独白',
    over_progression: '剧情发展过于跳跃，缺乏合理的过渡和承接',
    instruction_leakage: '出现技术指令用语(如COT、instruction、prompt等)',
    timeout: '生成等待时间超过30秒(根据系统记录判断)',
    error: '出现明显的系统错误信息或回复失败',
    too_short: '内容过于简短(少于10个有效字符)',
    empty: '回复内容为空或仅包含无意义符号',
    irrelevant: '完全无视用户上一轮输入，回复内容突兀不相关',
  }
  return map[key] ?? key
}

export default ChatTracingDetailPage


