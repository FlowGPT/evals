import { Button, Card, Descriptions, Select, SideSheet, Space, Table, Tag, Typography } from '@douyinfe/semi-ui'
import { IconPlus, IconRefresh } from '@douyinfe/semi-icons'
import { useEffect, useMemo, useState } from 'react'
import { cancelSamplingTask, getSamplingTasks, type SamplingTask, type SamplingTaskStatus } from '@/api/sampling'

export function SamplingJobsPage() {
  const [status, setStatus] = useState<'all' | SamplingTaskStatus>('all')
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<SamplingTask[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<SamplingTask | null>(null)
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const offset = (page - 1) * pageSize
      const list = await getSamplingTasks({ status: status === 'all' ? undefined : status, limit: pageSize, offset })
      setJobs(list || [])
      // 该接口不返回总数，这里根据是否满页来推断是否还有下一页，用于 Table 翻页控制
      const pseudoTotal = offset + (list?.length ?? 0) + ((list?.length ?? 0) === pageSize ? pageSize : 0)
      setTotal(pseudoTotal)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [status, page, pageSize])

  const columns = useMemo(() => ([
    {
      title: 'ID',
      dataIndex: 'id',
      render: (v: number, r: SamplingTask) => (
        <Button theme="borderless" onClick={() => { setActive(r); setOpen(true) }}>{v}</Button>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s: SamplingTaskStatus) => <StatusTag status={s} />
    },
    {
      title: 'Task ID',
      dataIndex: 'task_id',
    },
    {
      title: '用户',
      dataIndex: 'user_id',
    },
    {
      title: '重试',
      dataIndex: 'retry_count',
      render: (v: number) => <Tag size="small" type="light">{v}</Tag>
    },
    {
      title: '采样记录',
      dataIndex: 'sampling_record_id',
      render: (v: number | null) => v == null ? <Tag size="small" type="light">-</Tag> : <Tag size="small" type="solid" color="blue">{v}</Tag>
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      render: (t: string) => <Typography.Text type="tertiary">{formatTime(t)}</Typography.Text>
    },
    {
      title: '错误',
      dataIndex: 'error_message',
      width: 260,
      render: (v: string | null) => v ? <Typography.Paragraph ellipsis={{ rows: 1 }} style={{ margin: 0 }}>{v}</Typography.Paragraph> : <Typography.Text type="tertiary">-</Typography.Text>
    },
    {
      title: '操作',
      dataIndex: 'op',
      render: (_: any, r: SamplingTask) => (
        <Space>
          <Button theme="light" onClick={() => { setActive(r); setOpen(true) }}>详情</Button>
          <Button theme="solid" onClick={() => window.open(`/sampling/${encodeURIComponent(r.task_id)}`, '_self')}>查看日志</Button>
          {(['pending', 'ready', 'running', 'retry'] as SamplingTaskStatus[]).includes(r.status) && (
            <Button theme="light" type="danger" loading={cancellingId === r.task_id} onClick={async () => {
              try {
                setCancellingId(r.task_id)
                await cancelSamplingTask(r.task_id)
                fetchData()
              } finally {
                setCancellingId(null)
              }
            }}>取消任务</Button>
          )}
        </Space>
      )
    },
  ]), [cancellingId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card bordered={false} title={<Typography.Title heading={5} style={{ margin: 0 }}>抽样分析任务</Typography.Title>}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space>
            <Select
              style={{ width: 200 }}
              value={status}
              onChange={(v) => { setPage(1); setStatus(v as any) }}
              optionList={[
                { label: '全部状态', value: 'all' },
                { label: '等待中 (pending)', value: 'pending' },
                { label: '就绪 (ready)', value: 'ready' },
                { label: '执行中 (running)', value: 'running' },
                { label: '已完成 (completed)', value: 'completed' },
                { label: '失败 (failed)', value: 'failed' },
                { label: '重试 (retry)', value: 'retry' },
                { label: '已取消 (cancelled)', value: 'cancelled' },
              ]}
            />
          </Space>
          <Space>
            <Button theme="solid" icon={<IconPlus />} onClick={() => window.open('/sampling/create', '_self')}>新建任务</Button>
            <Button theme="light" icon={<IconRefresh />} onClick={fetchData}>刷新</Button>
          </Space>
        </Space>
      </Card>

      <Card bordered={false} style={{ boxShadow: 'var(--semi-shadow-elevated)' }}>
        <Table
          rowKey={(r?: SamplingTask) => String(r?.id ?? '')}
          loading={loading}
          columns={columns as any}
          dataSource={jobs}
          pagination={{ currentPage: page, pageSize, total, onPageChange: (p) => setPage(p), onPageSizeChange: (ps) => { setPage(1); setPageSize(ps) } }}
          size="small"
        />
      </Card>

      <SideSheet visible={open} onCancel={() => setOpen(false)} width={640} title={`任务详情 ${active?.id ?? ''}`}>
        {active && (
          <div style={{ display: 'grid', gap: 12 }}>
            <Space>
              <StatusTag status={active.status} />
              <Tag size="small" type="light">task_id {active.task_id}</Tag>
              <Tag size="small" type="light">user {active.user_id}</Tag>
            </Space>
            <Descriptions
              size="small"
              data={[
                { key: '创建', value: formatTime(active.created_at) },
                { key: 'sampling_record_id', value: active.sampling_record_id ?? '-' },
                { key: 'retry_count', value: active.retry_count },
              ].filter(Boolean) as any}
            />
            {active.error_message && <Typography.Text type="danger">{active.error_message}</Typography.Text>}
          </div>
        )}
      </SideSheet>
    </div>
  )
}

function StatusTag({ status }: { status: SamplingTaskStatus }) {
  switch (status) {
    case 'pending':
      return <Tag size="small" color="grey" type="light">等待中</Tag>
    case 'ready':
      return <Tag size="small" color="purple" type="solid">就绪</Tag>
    case 'running':
      return <Tag size="small" color="blue" type="solid">执行中</Tag>
    case 'completed':
      return <Tag size="small" color="green" type="solid">已完成</Tag>
    case 'failed':
      return <Tag size="small" color="red" type="solid">失败</Tag>
    case 'retry':
      return <Tag size="small" color="orange" type="solid">重试</Tag>
    case 'cancelled':
      return <Tag size="small" color="grey" type="solid">已取消</Tag>
  }
}

function formatTime(s?: string) {
  return s ? new Date(s).toLocaleString() : '-'
}

export default SamplingJobsPage


