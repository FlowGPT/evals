import { Button, Card, DatePicker, Input, Progress, Space, Table, Tag, Typography, Descriptions, SideSheet } from '@douyinfe/semi-ui'
import { IconSearch, IconRefresh } from '@douyinfe/semi-icons'
import { useEffect, useMemo, useState } from 'react'
import { getConversationAnalysisResults } from '@/api/analysisResults'
import { useNavigate } from 'react-router-dom'

export function ConversationTracingPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [detail, setDetail] = useState<any | null>(null)

  const [filtersDraft, setFiltersDraft] = useState({
    sampling_record_id: '' as any,
    processed_range: [] as any[],
  })
  const [filters, setFilters] = useState(filtersDraft)

  const fetchList = async () => {
    setLoading(true)
    try {
      const params: any = { page, page_size: pageSize }
      if (filters.sampling_record_id) params.sampling_record_id = Number(filters.sampling_record_id)
      if (filters.processed_range?.length === 2) {
        params.processed_at_start = new Date(filters.processed_range[0]).toISOString()
        params.processed_at_end = new Date(filters.processed_range[1]).toISOString()
      }
      const res = await getConversationAnalysisResults(params)
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

  useEffect(() => { fetchList() }, [page, pageSize, filters])

  const columns = useMemo(() => ([
    {
      title: '会话', width: 260,
      dataIndex: 'conversation_session_id',
      render: (_: any, r: any) => (
        <div>
          <Typography.Text strong>Session #{r.conversation_session_id}</Typography.Text>
          <div style={{ fontSize: 12, color: 'var(--semi-color-text-2)' }}>{r.session_type} · {new Date(r.processed_at).toLocaleString()}</div>
        </div>
      )
    },
    {
      title: '质量/问题',
      dataIndex: 'avg_chat_quality_index',
      width: 260,
      render: (_: any, r: any) => {
        const q = r.avg_chat_quality_index ?? 0
        const pr = r.problem_rate ?? 0
        const qPct = Math.round((q / 10) * 100)
        const prColor = pr > 0.6 ? 'red' : pr > 0.3 ? 'orange' : 'green'
        return (
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Typography.Text type="tertiary" style={{ minWidth: 32 }}>质量</Typography.Text>
              <Progress percent={qPct} showInfo format={() => `${q.toFixed(1)}/10`} style={{ width: 140 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Typography.Text type="tertiary" style={{ minWidth: 32 }}>问题</Typography.Text>
              <Tag color={prColor}>{(pr * 100).toFixed(1)}%</Tag>
              <Tag size="small" type="light">前3 {r.first_3_chat_quality_index?.toFixed?.(1) ?? r.first_3_chat_quality_index}</Tag>
              <Tag size="small" type="light">{r.total_chats} chats</Tag>
            </div>
          </div>
        )
      }
    },
    {
      title: '摘要/意图',
      dataIndex: 'analysis_result',
      width: 660,
      render: (ar: any, r: any) => (
        <div style={{ display: 'grid', gap: 6 }}>
          <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>{ar?.summary || ''}</Typography.Paragraph>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Typography.Text type="tertiary" style={{ fontSize: 12 }}>
              {ar?.intention || ''}
            </Typography.Text>
            <Button type="tertiary" size="small" onClick={() => setDetail({ ...r, analysis_result: ar })}>详情</Button>
          </div>
        </div>
      )
    },
    {
      title: '操作', width: 160,
      dataIndex: 'op',
      render: (_: any, r: any) => (
        <Button size="small" theme="light" onClick={() => navigate(`/conversation/${r.id}`)}>查看详情</Button>
      )
    },
  ]), [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card bordered={false} title={<Typography.Title heading={5} style={{ margin: 0 }}>Conversation Tracing</Typography.Title>}>
        <Space wrap style={{ marginTop: 8 }}>
          <Input placeholder="sampling_record_id" style={{ width: 220 }} onChange={(v: string) => setFiltersDraft(s => ({ ...s, sampling_record_id: v }))} value={filtersDraft.sampling_record_id} />
          <DatePicker type="dateRange" style={{ width: 360 }} value={filtersDraft.processed_range as any} onChange={(v: any) => setFiltersDraft(s => ({ ...s, processed_range: v as any }))} placeholder={['processed_at_start', 'processed_at_end']} />
          <Space>
            <Button theme="solid" onClick={() => { setPage(1); setFilters(filtersDraft) }}>查询</Button>
            <Button icon={<IconRefresh />} onClick={() => { const reset = { sampling_record_id: '', processed_range: [] as any[] }; setFiltersDraft(reset as any); setPage(1); setFilters(reset as any) }}>重置</Button>
          </Space>
        </Space>
      </Card>

      <Card bordered={false} style={{ boxShadow: 'var(--semi-shadow-elevated)' }}>
        <Table
          rowKey={(r) => `${r.sampling_record_id}-${r.conversation_session_id}-${r.id}`}
          loading={loading}
          columns={columns as any}
          dataSource={items}
          pagination={{ currentPage: page, pageSize, total, onPageChange: (p) => setPage(p), onPageSizeChange: (ps) => { setPage(1); setPageSize(ps) } }}
          size="small"
        />
      </Card>

      <SideSheet
        title={detail ? `Session #${detail.conversation_session_id}` : ''}
        visible={!!detail}
        onCancel={() => setDetail(null)}
        width={520}
      >
        {detail && (
          <div style={{ display: 'grid', gap: 12 }}>
            <Descriptions size="small" data={[
              { key: '类型', value: detail.session_type },
              { key: '处理时间', value: new Date(detail.processed_at).toLocaleString() },
              { key: '质量(0-10)', value: (detail.avg_chat_quality_index ?? 0).toFixed(2) },
              { key: '问题率', value: `${((detail.problem_rate ?? 0) * 100).toFixed(1)}%` },
              { key: '前3轮质量', value: detail.first_3_chat_quality_index },
              { key: '聊天条数', value: detail.total_chats },
            ]} />
            <Descriptions size="small" data={[
              { key: '摘要', value: <Typography.Paragraph>{detail.analysis_result?.summary || ''}</Typography.Paragraph> },
              { key: '意图', value: <Typography.Paragraph>{detail.analysis_result?.intention || ''}</Typography.Paragraph> },
              { key: '结束原因', value: <Typography.Paragraph>{detail.analysis_result?.stop_reason || ''}</Typography.Paragraph> },
            ]} />
          </div>
        )}
      </SideSheet>
    </div>
  )
}

export default ConversationTracingPage

// 保留工具函数如需扩展


