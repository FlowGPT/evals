import { useState } from 'react'
import { Button, Card, Form, Toast, Typography } from '@douyinfe/semi-ui'
import { setToken } from '@/auth/auth'
import { useLocation, useNavigate } from 'react-router-dom'

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      if (values.username && values.password) {
        setToken('mock-token')
        Toast.success('登录成功')
        navigate(from, { replace: true })
      } else {
        Toast.error('请输入用户名和密码')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--semi-color-fill-1), var(--semi-color-fill-2))'
    }}>
      <Card style={{ width: 380, boxShadow: 'var(--semi-shadow-elevated)' }} bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Typography.Title heading={4} style={{ margin: 0 }}>Evals 管理台</Typography.Title>
          <Typography.Text type="tertiary">请登录以继续</Typography.Text>
        </div>
        <Form onSubmit={handleSubmit} labelPosition="inset">
          {({ formState }) => (
            <>
              <Form.Input field="username" label="用户名" placeholder="请输入" rules={[{ required: true, message: '必填' }]} />
              <Form.Input mode="password" field="password" label="密码" placeholder="请输入" rules={[{ required: true, message: '必填' }]} />
              <Button block theme="solid" type="primary" htmlType="submit" loading={loading} disabled={loading}>
                登录
              </Button>
            </>
          )}
        </Form>
      </Card>
    </div>
  )
}


