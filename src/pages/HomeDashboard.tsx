import { Typography } from '@douyinfe/semi-ui'

export function HomeDashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16 }}>
      <div style={{ gridColumn: 'span 8', background: 'var(--semi-color-bg-1)', padding: 16, borderRadius: 8 }}>
        <Typography.Title heading={5}>今日概览</Typography.Title>
        <Typography.Text type="tertiary">关键指标与趋势</Typography.Text>
        <div style={{ height: 220, marginTop: 12, background: 'linear-gradient(180deg, rgba(22,119,255,0.15), transparent)', borderRadius: 8 }} />
      </div>
      <div style={{ gridColumn: 'span 4', display: 'grid', gap: 16 }}>
        <div style={{ background: 'var(--semi-color-bg-1)', padding: 16, borderRadius: 8 }}>
          <Typography.Text type="tertiary">活跃用户</Typography.Text>
          <Typography.Title heading={3} style={{ marginTop: 8 }}>1,284</Typography.Title>
        </div>
        <div style={{ background: 'var(--semi-color-bg-1)', padding: 16, borderRadius: 8 }}>
          <Typography.Text type="tertiary">成功率</Typography.Text>
          <Typography.Title heading={3} style={{ marginTop: 8 }}>98.2%</Typography.Title>
        </div>
        <div style={{ background: 'var(--semi-color-bg-1)', padding: 16, borderRadius: 8 }}>
          <Typography.Text type="tertiary">平均延迟</Typography.Text>
          <Typography.Title heading={3} style={{ marginTop: 8 }}>162ms</Typography.Title>
        </div>
      </div>
    </div>
  )
}

export default HomeDashboard


