import { Button, Card, Form, Space, Toast, Typography } from '@douyinfe/semi-ui'
import { IconArrowLeft, IconSend, IconRefresh } from '@douyinfe/semi-icons'
import { useCallback, useRef, useState } from 'react'
import { createSamplingTask } from '@/api/sampling'
import { useNavigate } from 'react-router-dom'

export default function CreateSamplingTaskPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const formApiRef = useRef<any>(null)
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

  const handleSubmit = useCallback(async (values: any) => {
    if (!values.chat_date) {
      Toast.error('请选择采样日期')
      return
    }
    const payload = {
      chat_date: formatYmd(new Date(values.chat_date)),
      limit: Number(values.limit ?? 1),
      priority: Number(values.priority ?? 5),
      task_user_id: String(values.task_user_id || 'admin'),
    }
    setSubmitting(true)
    try {
      const res = await createSamplingTask(payload)
      if (res?.success) {
        Toast.success('任务创建成功')
        navigate('/sampling-jobs')
      } else {
        Toast.error('任务创建失败')
      }
    } finally {
      setSubmitting(false)
    }
  }, [navigate])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card bordered={false}
        title={<Typography.Title heading={5} style={{ margin: 0 }}>新建抽样任务</Typography.Title>}
        headerExtraContent={
          <Space>
            <Button icon={<IconArrowLeft />} type="tertiary" onClick={() => navigate(-1)}>返回</Button>
            <Button icon={<IconRefresh />} type="tertiary" onClick={() => formApiRef.current?.reset?.()}>重置</Button>
          </Space>
        }
      >
        <Typography.Text type="tertiary">设置采样日期、条目上限、优先级与任务归属人</Typography.Text>
      </Card>

      <Card bordered={false} style={{ boxShadow: 'var(--semi-shadow-elevated)', background: 'linear-gradient(180deg, rgba(80,140,255,0.06), rgba(0,0,0,0.00))' }}>
        <Form labelPosition="left" labelAlign="left" style={{ maxWidth: 600 }} onSubmit={handleSubmit} getFormApi={(api) => (formApiRef.current = api)}>
          <Form.Section text="基础配置"/>
          <Form.DatePicker
            field="chat_date"
            label="采样日期"
            type="date"
            style={{ width: 220 }}
            disabledDate={(d: any) => {
              const t = new Date(d)
              const ts = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime()
              // 仅可选择今天之前的日期（不包含今天）
              return ts >= todayStart
            }}
            rules={[{ required: true, message: '请选择日期（仅可选择今天之前）' }]}
            placeholder="仅可选择今天之前"
          />
          <Form.InputNumber
            field="limit"
            label="抽取用户数量上限"
            min={1}
            max={1000}
            step={1}
            style={{ width: 220 }}
            initValue={1}
            rules={[{ required: true, message: '请输入1~1000之间的数' }]}
            placeholder="1~1000"
          />
          <Form.Select
            field="priority"
            label="优先级"
            style={{ width: 220 }}
            initValue={5}
            optionList={[1,2,3,4,5].map(n => ({ label: String(n), value: n }))}
            rules={[{ required: true, message: '请选择优先级(1-5)' }]}
          />
          <Form.Input field="task_user_id" label="任务归属人" style={{ width: 220 }} initValue="admin" rules={[{ required: true, message: '请输入任务用户ID' }]} />
          <Form.Slot>
            <Space>
              <Button theme="solid" icon={<IconSend />} loading={submitting} htmlType="submit">创建任务</Button>
              <Button onClick={() => formApiRef.current?.reset?.()}>重置</Button>
            </Space>
          </Form.Slot>
        </Form>
      </Card>
    </div>
  )
}

function formatYmd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}


