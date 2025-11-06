import { Button, Card, Descriptions, Empty, Space, Tag, Typography } from '@douyinfe/semi-ui'
import { IconArrowLeft, IconRefresh } from '@douyinfe/semi-icons'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSamplingTaskLogs, type SamplingTaskLog } from '@/api/sampling'

export default function SamplingTaskLogsPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<SamplingTaskLog[]>([])

  const fetchLogs = async () => {
    if (!taskId) return
    setLoading(true)
    try {
      const res = await getSamplingTaskLogs(taskId, 100, 0)
      setLogs(res.items || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [taskId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card bordered={false}
        title={<Typography.Title heading={5} style={{ margin: 0 }}>任务日志 {taskId}</Typography.Title>}
        headerExtraContent={
          <Space>
            <Button icon={<IconArrowLeft />} onClick={() => navigate(-1)} type="tertiary">返回</Button>
            <Button icon={<IconRefresh />} onClick={fetchLogs} loading={loading}>刷新</Button>
          </Space>
        }
      >
        <Descriptions size="small" data={[{ key: 'task_id', value: taskId }]} />
      </Card>

      <Card bordered={false} style={{ boxShadow: 'var(--semi-shadow-elevated)' }} loading={loading}>
        {logs.length === 0 ? (
          <Empty description="暂无日志" />
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 9, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, var(--semi-color-border), transparent)' }} />
            <div style={{ display: 'grid', gap: 12 }}>
              {logs.map((l) => (
                <LogItem key={l.id} log={l} />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function LogItem({ log }: { log: SamplingTaskLog }) {
  const levelColor = log.level === 'error' ? 'red' : log.level === 'warn' ? 'orange' : log.level === 'debug' ? 'grey' : 'blue'
  const bg = levelColor === 'red'
    ? 'linear-gradient(180deg, rgba(255,77,79,0.10), rgba(255,77,79,0.03))'
    : levelColor === 'orange'
      ? 'linear-gradient(180deg, rgba(255,160,0,0.12), rgba(255,160,0,0.03))'
      : levelColor === 'blue'
        ? 'linear-gradient(180deg, rgba(80,140,255,0.12), rgba(80,140,255,0.03))'
        : 'linear-gradient(180deg, rgba(127,127,127,0.10), rgba(127,127,127,0.03))'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '18px 1fr', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 10, height: 10, borderRadius: 20, background: `var(--semi-color-${levelColor})`, marginTop: 6, boxShadow: `0 0 0 3px var(--semi-color-bg-0)` }} />
      </div>
      <div style={{ padding: 14, borderRadius: 12, background: bg, border: '1px solid var(--semi-color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <Space>
            <Tag size="small" type="solid" color={levelColor}>{log.level.toUpperCase()}</Tag>
            <Tag size="small" type="light">{log.step}</Tag>
            {log.user_id && <Tag size="small" type="light" color="purple">user {log.user_id}</Tag>}
          </Space>
          <Tag size="small" type="light">{new Date(log.created_at).toLocaleString()}</Tag>
        </div>
        <Typography.Paragraph style={{ marginTop: 8, marginBottom: 8 }}>{log.message}</Typography.Paragraph>
        {log.details && Object.keys(log.details).length > 0 && (
          <pre style={{ margin: 0, padding: 10, background: 'var(--semi-color-bg-1)', borderRadius: 8, fontSize: 12, overflow: 'auto' }}>
{JSON.stringify(log.details, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}


