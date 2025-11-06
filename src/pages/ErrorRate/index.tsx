import { Card, Col, Row, Typography, Space, Tag } from '@douyinfe/semi-ui'
import { useEffect, useMemo, useState } from 'react'
import { getChatQualityStatsRange, type TypeKey } from '@/api/chatQuality'

const METRICS: { key: TypeKey; title: string }[] = [
  { key: 'full_repetition', title: '完全重复 (full_repetition)' },
  { key: 'partial_repetition', title: '部分重复 (partial_repetition)' },
  { key: 'semantic_repetition', title: '语义重复 (semantic_repetition)' },
  { key: 'ooc', title: '角色行为不一致 (ooc)' },
  { key: 'ooh', title: '不符合历史 (ooh)' },
  { key: 'oou', title: '不符合世界观 (oou)' },
  { key: 'hard_rejection', title: '硬拒绝 (hard_rejection)' },
  { key: 'no_progression', title: '无进展 (no_progression)' },
  { key: 'over_progression', title: '过度推进 (over_progression)' },
  { key: 'instruction_leakage', title: '指令泄露 (instruction_leakage)' },
  { key: 'timeout', title: '超时 (timeout)' },
  { key: 'error', title: '错误 (error)' },
  { key: 'too_short', title: '过短 (too_short)' },
  { key: 'empty', title: '空消息 (empty)' },
  { key: 'irrelevant', title: '不相关 (irrelevant)' }
]

export function ErrorRatePage() {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - 6)

  const [startDate, setStartDate] = useState<string>(formatDate(start))
  const [endDate, setEndDate] = useState<string>(formatDate(today))
  const [loading, setLoading] = useState<boolean>(false)
  const [seriesByType, setSeriesByType] = useState<Record<TypeKey, { label: string; value: number }[]>>({} as any)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const json = await getChatQualityStatsRange(startDate, endDate)
        if (!cancelled && json?.success) {
          const sorted = [...(json.data || [])].sort((a, b) => a.stat_date.localeCompare(b.stat_date))
          const byType: Record<TypeKey, { label: string; value: number }[]> = {} as any
          METRICS.forEach(m => {
            byType[m.key] = sorted.map(d => ({ label: d.stat_date, value: clamp(d.type_rates?.[m.key] ?? 0, 0, 1) }))
          })
          setSeriesByType(byType)
        }
      } catch (e) {
        // 忽略错误，保持空数据
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [startDate, endDate])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card bordered={false} style={{ boxShadow: 'var(--semi-shadow-elevated)' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Typography.Text type="tertiary">展示区间：{startDate} ~ {endDate}（默认近7天）</Typography.Text>
          <Typography.Text type="tertiary"></Typography.Text>
        </Space>
      </Card>

      <Row gutter={16}>
        {METRICS.map(m => (
          <Col key={m.key} span={8}>
            <Card bordered={false} title={<Typography.Title heading={5} style={{ margin: 0 }}>{m.title}</Typography.Title>}>
              <MetricLineChart
                loading={loading}
                data={seriesByType[m.key] || []}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

function MetricLineChart({ data, loading }: { data: { label: string; value: number }[]; loading?: boolean }) {
  const series = useMemo(() => {
    return (data || []).map(d => ({ label: d.label, value: clamp(d.value, 0, 1) }))
  }, [data])
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const values = series.map(d => d.value)
  const rawMin = values.length ? Math.min(...values) : 0
  const rawMax = values.length ? Math.max(...values) : 1
  const range = Math.max(1e-6, rawMax - rawMin)
  const pad = Math.max(0.02, range * 0.15)
  const minY = Math.max(0, rawMin - pad)
  const maxY = Math.min(1, rawMax + pad)
  const makeTicks = (min: number, max: number, count = 5) => Array.from({ length: count }, (_, i) => min + (i / (count - 1)) * (max - min))
  const fmtPct = (v: number) => `${(v * 100).toFixed(0)}%`

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 10 }}>
        {Array.from({ length: 1 }).map((_, i) => (
          <div key={i} style={{ height: 300, borderRadius: 8, background: 'var(--semi-color-fill-0)' }} />
        ))}
      </div>
    )
  }

  if (!series.length) {
    return <Typography.Text type="tertiary">暂无数据</Typography.Text>
  }

  const width = 1000
  const height = 300
  const padding = { left: 44, right: 12, top: 18, bottom: 34 }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const n = series.length

  const xAt = (i: number) => n === 1 ? padding.left + innerW / 2 : padding.left + (i / (n - 1)) * innerW
  const yAt = (v: number) => padding.top + innerH - ((v - minY) / (maxY - minY)) * innerH

  // 柱状图布局：以均分的步长，柱中心与折线的 x 对齐
  const step = innerW / Math.max(n, 1)
  const barWidth = Math.max(4, step * 0.6)
  const barXAt = (i: number) => padding.left + i * step + (step - barWidth) / 2
  const lineXAt = (i: number) => padding.left + i * step + step / 2

  const points = series.map((d, i) => ({ x: lineXAt(i), y: yAt(Math.max(0, Math.min(1, d.value))) }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  const last = series[series.length - 1]
  const prev = series[series.length - 2] || last
  const lastDelta = last.value - prev.value
  const lastColor = last.value > 0.6 ? 'var(--semi-color-danger)' : last.value > 0.3 ? 'var(--semi-color-warning)' : 'var(--semi-color-success)'
  const barColor = 'var(--semi-color-primary)'
  const gridColor = 'var(--semi-color-border)'
  const axisText = 'var(--semi-color-text-2)'
  const labelEvery = Math.max(1, Math.ceil(n / 8))
  const hi = hoverIndex != null ? hoverIndex : -1
  const hoverX = hi >= 0 ? lineXAt(hi) : 0
  const hoverY = hi >= 0 ? yAt(series[hi].value) : 0

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <Space style={{ justifyContent: 'space-between' }}>
        <Typography.Text type="tertiary">每日错误率</Typography.Text>
        <Space>
          <Typography.Text>当前值 {(last.value * 100).toFixed(2)}%</Typography.Text>
          <Tag size="small" color={lastDelta >= 0 ? 'red' : 'green'} type="light">{lastDelta >= 0 ? '+' : ''}{(lastDelta * 100).toFixed(2)}%</Tag>
        </Space>
      </Space>

      <div style={{ width: '100%', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: 300 }}
          onMouseMove={(e) => {
            const svg = (e.currentTarget as SVGSVGElement)
            const rect = svg.getBoundingClientRect()
            const x = e.clientX - rect.left
            // 使用区间划分，避免靠近某日左侧时被吸附到前一天
            const ix = Math.floor((x - padding.left) / step)
            const clamped = Math.max(0, Math.min(n - 1, ix))
            if (!Number.isNaN(clamped)) setHoverIndex(clamped)
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="er-line" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lastColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={lastColor} stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="er-bar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={barColor} stopOpacity="0.55" />
              <stop offset="100%" stopColor={barColor} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <rect x={padding.left} y={padding.top} width={innerW} height={innerH} rx="8" fill="var(--semi-color-bg-0)" />
          {/* y 轴网格与刻度 */}
          {makeTicks(minY, maxY, 5).map((t, i) => (
            <g key={i}>
              <line x1={padding.left} x2={padding.left + innerW} y1={yAt(t)} y2={yAt(t)} stroke={gridColor} strokeOpacity="0.35" strokeWidth="1" />
              <text x={padding.left - 8} y={yAt(t)} dominantBaseline="middle" textAnchor="end" fontSize="14" fontWeight={600} fill={axisText}>
                {fmtPct(t)}
              </text>
            </g>
          ))}

          {/* 柱状图 */}
          {series.map((d, i) => {
            const x = barXAt(i)
            const y = yAt(Math.max(0, Math.min(1, d.value)))
            const h = padding.top + innerH - y
            return (
              <rect key={`bar-${i}`} x={x} y={y} width={barWidth} height={Math.max(1, h)} fill="url(#er-bar)" rx="2" />
            )
          })}

          {/* 折线覆盖在柱子之上 */}
          <path d={path} stroke={lastColor} strokeWidth="2" fill="none" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={lastColor} />
          ))}
          {hi >= 0 && (
            <g>
              <line x1={hoverX} x2={hoverX} y1={padding.top} y2={padding.top + innerH} stroke={gridColor} strokeDasharray="4 4" />
              <circle cx={hoverX} cy={hoverY} r="5" fill={lastColor} stroke="#fff" strokeWidth="1.5" />
              {(() => {
                const boxW = 148
                const boxH = 56
                const tx = Math.min(padding.left + innerW - boxW - 4, Math.max(padding.left + 4, hoverX + 8))
                const ty = Math.max(padding.top + 4, Math.min(padding.top + innerH - boxH - 4, hoverY - boxH - 8))
                return (
                  <g>
                    <rect x={tx} y={ty} width={boxW} height={boxH} rx="8" fill="var(--semi-color-bg-2)" stroke={gridColor} />
                    <text x={tx + 10} y={ty + 18} fontSize="12" fontWeight={600} fill="var(--semi-color-text-0)">{series[hi].label}</text>
                    <text x={tx + 10} y={ty + 36} fontSize="16" fontWeight={700} fill={lastColor}>{(series[hi].value * 100).toFixed(2)}%</text>
                  </g>
                )
              })()}
            </g>
          )}
          {/* x labels */}
          {series.map((d, i) => (
            <text key={i} x={lineXAt(i)} y={height - 8} dominantBaseline="ideographic" textAnchor="middle" fontSize="14" fill={axisText} opacity={i % labelEvery === 0 || i === n - 1 ? 1 : 0}>
              {i % labelEvery === 0 || i === n - 1 ? truncate(d.label, 14) : ''}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s
  return s.slice(0, Math.max(0, n - 1)) + '…'
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}


