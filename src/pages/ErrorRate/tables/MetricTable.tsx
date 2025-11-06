import { Table, Tag, Typography } from '@douyinfe/semi-ui'
import type { Dim, MetricRow } from '@/types/errorRate'

interface Props {
  dims: Dim[]
  rows: MetricRow[]
  loading?: boolean
}

export function MetricTable({ dims, rows, loading }: Props) {
  const columns = [
    ...dims.map(dim => ({
      title: dimTitle(dim),
      dataIndex: 'dimValues',
      render: (_: any, r: MetricRow) => {
        const text = r.dimValues?.[dim]
        return text ? <Tag>{text}</Tag> : '-'
      }
    })),
    {
      title: 'Error Rate',
      dataIndex: 'value',
      render: (v: number, r: MetricRow) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Typography.Text>{(v * 100).toFixed(2)}%</Typography.Text>
          {r.delta !== undefined && (
            <Typography.Text type={r.delta >= 0 ? 'danger' : 'success'}>{r.delta >= 0 ? '+' : ''}{(r.delta * 100).toFixed(2)}%</Typography.Text>
          )}
        </div>
      )
    }
  ]

  return (
    <Table
      size="small"
      loading={loading}
      columns={columns as any}
      dataSource={rows}
      pagination={{ pageSize: 10 }}
    />
  )
}

function dimTitle(dim: Dim) {
  switch (dim) {
    case 'model': return '模型'
    case 'language': return '语种'
    case 'country': return '国家'
    case 'gender': return '性别'
  }
}


