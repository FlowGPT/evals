import { Avatar, Badge, Button, Card, DatePicker, Input, Progress, Select, Space, Table, Tag, Typography } from '@douyinfe/semi-ui'
import { IconHistogram, IconSearch, IconRefresh } from '@douyinfe/semi-icons'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChatAnalysisResults } from '@/api/analysisResults'

export function ChatTracingPage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const PROBLEM_TYPES = [
    'ooc', 'ooh', 'oou', 'empty', 'error', 'timeout', 'too_short', 'irrelevant', 'hard_rejection', 'no_progression', 'full_repetition', 'over_progression', 'partial_repetition', 'instruction_leakage', 'semantic_repetition'
  ] as const

  const [filtersDraft, setFiltersDraft] = useState({
    conversation_id: '',
    message_id: '',
    sampling_record_id: '' as any,
    has_problem: 'all' as 'all' | 'true' | 'false',
    problem_types: [] as string[],
    processed_range: [] as any[],
  })
  const [filters, setFilters] = useState(filtersDraft)

  const fetchList = async () => {
    // 清空当前数据，避免新结果与旧结果“视觉上”拼接
    setItems([])
    setTotal(0)
    setLoading(true)
    try {
      const params: any = {
        page,
        page_size: pageSize,
      }
      if (filters.conversation_id) params.conversation_id = filters.conversation_id
      if (filters.message_id) params.message_id = filters.message_id
      if (filters.sampling_record_id) params.sampling_record_id = Number(filters.sampling_record_id)
      if (filters.has_problem !== 'all') params.has_problem = filters.has_problem === 'true'
      if (filters.problem_types?.length) params.problem_types = filters.problem_types
      if (filters.processed_range?.length === 2) {
        params.processed_at_start = new Date(filters.processed_range[0]).toISOString()
        params.processed_at_end = new Date(filters.processed_range[1]).toISOString()
      }
      const res = await getChatAnalysisResults(params)
      if (res?.success) {
        setItems(res.items || [])
        setTotal(res.total || 0)
      } else {
        setItems([])
        setTotal(0)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters])

  const columns = useMemo(() => ([
    {
      title: '会话',
      dataIndex: 'conversation_id',
      render: (_: any, r: any) => (
        <Space>
          <div>
            <Typography.Text strong>{r.conversation_id}</Typography.Text>
            <div style={{ fontSize: 12, color: 'var(--semi-color-text-2)' }}>Session #{r.conversation_session_id}</div>
          </div>
        </Space>
      )
    },
    {
      title: '消息',
      dataIndex: 'message_id',
      render: (_: any, r: any) => (
        <div>
          <Typography.Text type="tertiary" style={{ fontSize: 12 }}>#{r.message_index} · {r.message_id}</Typography.Text>
          <div style={{ fontSize: 12, color: 'var(--semi-color-text-2)', maxWidth: 560, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.message_content}</div>
        </div>
      )
    },
    {
      title: '评分',
      dataIndex: 'analysis_result',
      render: (_: any, r: any) => {
        const s = r.analysis_result?.scores || {}
        const avg = ((s.novelty_score ?? 0) + (s.immersion_score ?? 0) + (s.relevance_score ?? 0) + (s.consistency_score ?? 0) + (s.progression_score ?? 0) + (s.satisfaction_score ?? 0)) / 6
        return (
          <Space>
            <Progress percent={Math.round((avg / 10) * 100)} showInfo format={(p) => `${p}%`} style={{ width: 120 }} />
            <Tag>{avg.toFixed(1)}</Tag>
          </Space>
        )
      }
    },
    {
      title: '问题',
      dataIndex: 'has_problem',
      render: (_: any, r: any) => {
        const fromFlag = r.has_problem === true
        const fromList = Array.isArray(r.problem_types) && r.problem_types.length > 0
        const fromMap = r.analysis_result?.problems ? Object.values(r.analysis_result.problems as Record<string, boolean>).some(Boolean) : false
        const hasProblem = fromFlag || fromList || fromMap
        const label = hasProblem ? '有问题' : '无问题'
        return (
          <Space wrap>
            <Tag color={hasProblem ? 'red' : 'green'}>{label}</Tag>
            {hasProblem && (r.problem_types || []).map((t: string) => (
              <Tag key={t} size="small" type="light" color="orange">{t}</Tag>
            ))}
          </Space>
        )
      }
    },
    {
      title: '时间',
      dataIndex: 'processed_at',
      render: (_: any, r: any) => (
        <Typography.Text type="tertiary" style={{ fontSize: 12 }}>{new Date(r.processed_at).toLocaleString()}</Typography.Text>
      )
    },
    {
      title: '操作',
      dataIndex: 'op',
      render: (_: any, r: any) => (
        <Button size="small" theme="light" onClick={() => navigate(`/chat/${r.id}`)}>查看详情</Button>
      )
    }
  ]), [navigate])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card bordered={false} title={<Typography.Title heading={5} style={{ margin: 0 }}>Chat Tracing</Typography.Title>}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Text type="tertiary">按会话与消息维度查看评分与问题标注</Typography.Text>
        </Space>
      </Card>

      <Card bordered={false} style={{ boxShadow: 'var(--semi-shadow-elevated)' }}>
        <Space wrap style={{ marginBottom: 12 }}>
          <Input placeholder="conversation_id" style={{ width: 240 }} value={filtersDraft.conversation_id} onChange={(v: string) => setFiltersDraft(s => ({ ...s, conversation_id: String(v) }))} prefix={<IconSearch />} />
          <Input placeholder="message_id" style={{ width: 240 }} value={filtersDraft.message_id} onChange={(v: string) => setFiltersDraft(s => ({ ...s, message_id: String(v) }))} />
          <Input placeholder="sampling_record_id" style={{ width: 200 }} value={filtersDraft.sampling_record_id} onChange={(v: string) => setFiltersDraft(s => ({ ...s, sampling_record_id: v }))} />
          <Select style={{ width: 160 }} value={filtersDraft.has_problem} onChange={(v: any) => setFiltersDraft(s => ({ ...s, has_problem: (v as 'all' | 'true' | 'false') ?? 'all' }))} optionList={[
            { value: 'all', label: '是否有问题(全部)' },
            { value: 'true', label: '仅有问题' },
            { value: 'false', label: '仅正常' },
          ]} />
          <Select style={{ width: 360 }} multiple maxTagCount={3} value={filtersDraft.problem_types} onChange={(v: any) => setFiltersDraft(s => ({ ...s, problem_types: (v as string[]) ?? [] }))}
            placeholder="problem_types (多选)"
            optionList={PROBLEM_TYPES.map(t => ({ value: t, label: t }))}
          />
          <DatePicker type="dateRange" style={{ width: 360 }} value={filtersDraft.processed_range as any} onChange={(v: any) => setFiltersDraft(s => ({ ...s, processed_range: v as any }))} placeholder={['processed_at_start', 'processed_at_end']} />
          <Space>
            <Button theme="solid" onClick={() => { setPage(1); setFilters(filtersDraft) }}>查询</Button>
            <Button icon={<IconRefresh />} onClick={() => { const reset = { conversation_id: '', message_id: '', sampling_record_id: '', has_problem: 'all' as const, problem_types: [] as string[], processed_range: [] as any[] }; setFiltersDraft(reset); setPage(1); setFilters(reset) }}>重置</Button>
          </Space>
        </Space>

        <Table
          rowKey={(r?: any) => r?.id ?? `${r?.sampling_record_id ?? ''}-${r?.conversation_session_id ?? ''}-${r?.message_id ?? ''}`}
          loading={loading}
          columns={columns as any}
          dataSource={items}
          pagination={{ currentPage: page, pageSize, total, onPageChange: (p) => setPage(p), onPageSizeChange: (ps) => { setPage(1); setPageSize(ps) } }}
          size="small"
        />
      </Card>
    </div>
  )
}

export default ChatTracingPage