import { Typography } from '@douyinfe/semi-ui'

export function SettingsPage() {
  return (
    <div style={{ background: 'var(--semi-color-bg-1)', padding: 16, borderRadius: 8 }}>
      <Typography.Title heading={5}>设置</Typography.Title>
      <Typography.Text type="tertiary">这里可以配置系统参数与偏好</Typography.Text>
    </div>
  )
}

export default SettingsPage


