import { Avatar, Badge, Breadcrumb, Button, Dropdown, Layout, Nav, Space, Typography } from '@douyinfe/semi-ui'
import { IconHistogram, IconSetting, IconExit } from '@douyinfe/semi-icons'
import { clearToken } from '@/auth/auth'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const { Header, Sider, Content } = Layout

export function HomeLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedKey = useSelectedKey(location.pathname)

  const handleLogout = () => {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider style={{ background: 'var(--semi-color-bg-1)' }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
          <IconHistogram style={{ fontSize: 24 }} />
          <Typography.Title heading={5} style={{ margin: 0 }}>Evals</Typography.Title>
        </div>
        <Nav
          style={{ maxWidth: '100%' }}
          selectedKeys={[selectedKey]}
          items={[
            { itemKey: 'error-rate', text: 'Error Rate 看板', icon: <span role="img" aria-label="error-rate" style={{ fontSize: 18 }}>📉</span> },
            { itemKey: 'score-summary', text: 'Score Summary 看板', icon: <span role="img" aria-label="score-summary" style={{ fontSize: 18 }}>📊</span> },
            { itemKey: 'conversation-tracing', text: 'Conversation Tracing', icon: <span role="img" aria-label="conversation-tracing" style={{ fontSize: 18 }}>🗂️</span> },
            { itemKey: 'engagement-tracing', text: 'Engagement Tracing', icon: <span role="img" aria-label="engagement-tracing" style={{ fontSize: 18 }}>📈</span> },
            { itemKey: 'chat-tracing', text: 'Chat Tracing', icon: <span role="img" aria-label="chat-tracing" style={{ fontSize: 18 }}>💬</span> },
            { itemKey: 'sampling-jobs', text: '抽样分析任务', icon: <span role="img" aria-label="sampling-jobs" style={{ fontSize: 18 }}>🧪</span> },
          ]}
          onSelect={(data: { itemKey: string | number }) => navigate(navKeyToPath(String(data.itemKey)))}
        />
      </Sider>
      <Layout style={{ padding: '24px' }}>
        <Header style={{ background: 'var(--semi-color-bg-0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Breadcrumb>
              <Breadcrumb.Item>首页</Breadcrumb.Item>
              <Breadcrumb.Item>{selectedKey}</Breadcrumb.Item>
            </Breadcrumb>
            <Space>

              <Dropdown
                position="bottomRight"
                render={
                  <Dropdown.Menu>
                    <Dropdown.Item icon={<IconSetting />}>个人设置</Dropdown.Item>
                    <Dropdown.Item icon={<IconExit />} onClick={handleLogout}>退出登录</Dropdown.Item>
                  </Dropdown.Menu>
                }
              >
                <Avatar color="blue" size="small" style={{ cursor: 'pointer' }}>SL</Avatar>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content style={{ padding: '6px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

function navKeyToPath(key: string): string {
  switch (key) {
    case 'home': return '/'
    case 'error-rate': return '/error-rate'
    case 'score-summary': return '/score-summary'
    case 'conversation-tracing': return '/conversation-tracing'
    case 'engagement-tracing': return '/engagement-tracing'
    case 'chat-tracing': return '/chat-tracing'
    case 'sampling-jobs': return '/sampling-jobs'
    case 'settings': return '/settings'
    default: return '/'
  }
}

function useSelectedKey(pathname: string): string {
  if (pathname.startsWith('/error-rate')) return 'error-rate'
  if (pathname.startsWith('/score-summary')) return 'score-summary'
  if (pathname.startsWith('/conversation-tracing')) return 'conversation-tracing'
  if (pathname.startsWith('/engagement-tracing')) return 'engagement-tracing'
  if (pathname.startsWith('/chat-tracing')) return 'chat-tracing'
  if (pathname.startsWith('/sampling-jobs')) return 'sampling-jobs'
  if (pathname.startsWith('/settings')) return 'settings'
  return 'home'
}


