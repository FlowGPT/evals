import { Button, Card, DatePicker, Descriptions, Input, Progress, Space, Table, Tag, Typography } from '@douyinfe/semi-ui'
import { IconRefresh, IconSearch } from '@douyinfe/semi-icons'
import { useEffect, useMemo, useState } from 'react'
import { getContentAnalysisResults } from '@/api/analysisResults'
import { useNavigate } from 'react-router-dom'

export function EngagementTracingPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const [filtersDraft, setFiltersDraft] = useState({
    user_id: '',
    sampling_record_id: '' as any,
    created_range: [] as any[],
  })
  const [filters, setFilters] = useState(filtersDraft)

  const fetchList = async () => {
    setLoading(true)
    try {
      const params: any = { page, page_size: pageSize }
      if (filters.user_id) params.user_id = filters.user_id
      if (filters.sampling_record_id) params.sampling_record_id = Number(filters.sampling_record_id)
      if (filters.created_range?.length === 2) {
        const start = formatYmd(new Date(filters.created_range[0]))
        const endPlus = addDays(new Date(filters.created_range[1]), 1)
        params.created_at_start = start
        params.created_at_end = formatYmd(endPlus)
      }
      const res = await getContentAnalysisResults(params)
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
      title: '用户/记录',
      dataIndex: 'user_id',
      render: (_: any, r: any) => (
        <div>
          <Typography.Text strong>{r.user_id}</Typography.Text>
          <div style={{ fontSize: 12, color: 'var(--semi-color-text-2)' }}>record #{r.sampling_record_id}</div>
        </div>
      )
    },
    {
      title: '统计',
      dataIndex: 'statistics',
      render: (st: any, r: any) => {
        const s = st || r.statistics || {}
        return (
          <Space wrap>
            <Space>
              <Typography.Text type="tertiary">质量</Typography.Text>
              <Progress percent={Math.round(((s.avg_quality_index ?? r.avg_quality_index ?? 0) / 10) * 100)} showInfo format={(p) => `${p}%`} style={{ width: 120 }} />
            </Space>
            <Space>
              <Typography.Text type="tertiary">问题率</Typography.Text>
              <Tag color={(s.avg_problem_rate ?? r.avg_problem_rate ?? 0) > 0.6 ? 'red' : (s.avg_problem_rate ?? r.avg_problem_rate ?? 0) > 0.3 ? 'orange' : 'green'}>
                {(((s.avg_problem_rate ?? r.avg_problem_rate ?? 0) * 100)).toFixed(1)}%
              </Tag>
            </Space>
            <Tag size="small" type="light">chats {s.total_chats_analyzed ?? r.total_chats_analyzed ?? 0}</Tag>
            <Tag size="small" type="light">convs {s.total_conversations_analyzed ?? r.total_conversations_analyzed ?? 0}</Tag>
          </Space>
        )
      }
    },
    {
      title: 'Engagement 概览',
      dataIndex: 'analysis_data',
      width: 520,
      render: (ad: any) => {
        const er = ad?.engagement_result || {}
        const summary = er?.analysis_result?.summary || ''
        const stats = er?.statistics || {}
        return (
          <div style={{ display: 'grid', gap: 6 }}>
            <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>{summary}</Typography.Paragraph>
            <Space wrap>
              <Tag size="small">{stats.total_conversations ?? '-'} convs</Tag>
              <Tag size="small">{stats.total_chats ?? '-'} chats</Tag>
              <Tag size="small">{stats.duration_minutes ?? '-'} min</Tag>
            </Space>
          </div>
        )
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      render: (t: string) => <Typography.Text type="tertiary" style={{ fontSize: 12 }}>{new Date(t).toLocaleString()}</Typography.Text>
    },
    {
      title: '操作',
      dataIndex: 'op',
      render: (_: any, r: any) => (
        <Button size="small" theme="light" onClick={() => navigate(`/engagement/${r.id}`)}>查看详情</Button>
      )
    },
  ]), [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card bordered={false} title={<Typography.Title heading={5} style={{ margin: 0 }}>Engagement Tracing（按用户聚合）</Typography.Title>}>
        <Space wrap style={{ marginTop: 8 }}>
          <Input placeholder="user_id" style={{ width: 260 }} onChange={(v: string) => setFiltersDraft(s => ({ ...s, user_id: v }))} prefix={<IconSearch />} value={filtersDraft.user_id} />
          <Input placeholder="sampling_record_id" style={{ width: 220 }} onChange={(v: string) => setFiltersDraft(s => ({ ...s, sampling_record_id: v }))} value={filtersDraft.sampling_record_id} />
          <DatePicker type="dateRange" style={{ width: 360 }} value={filtersDraft.created_range as any} onChange={(v: any) => setFiltersDraft(s => ({ ...s, created_range: v as any }))} placeholder={['created_at_start', 'created_at_end']} />
          <Space>
            <Button theme="solid" onClick={() => { setPage(1); setFilters(filtersDraft) }}>查询</Button>
            <Button icon={<IconRefresh />} onClick={() => { const reset = { user_id: '', sampling_record_id: '', created_range: [] as any[] }; setFiltersDraft(reset as any); setPage(1); setFilters(reset as any) }}>重置</Button>
          </Space>
        </Space>
      </Card>

      <Card bordered={false} style={{ boxShadow: 'var(--semi-shadow-elevated)' }}>
        <Table
          rowKey={(r) => `${r.user_id}-${r.sampling_record_id}-${r.created_at}`}
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

export default EngagementTracingPage

function formatYmd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(d: Date, n: number) {
  const nd = new Date(d)
  nd.setDate(nd.getDate() + n)
  return nd
}


