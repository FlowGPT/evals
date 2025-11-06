import { Card, Col, Row, Typography, Space, Tag } from '@douyinfe/semi-ui'
import { useEffect, useMemo, useState } from 'react'
import { getChatQualityStatsRange } from '@/api/chatQuality'

type ScoreKey =
  | 'overall_score'
  | 'novelty_score'
  | 'immersion_score'
  | 'relevance_score'
  | 'consistency_score'
  | 'progression_score'
  | 'satisfaction_score'

const METRICS: { key: ScoreKey; title: string; desc?: string }[] = [
  { key: 'overall_score', title: '总体评分 (overall_score)' },
  { key: 'relevance_score', title: '相关性 (relevance_score)', desc: '是否紧贴用户意图且衔接自然 (1-10分)' },
  { key: 'consistency_score', title: '一致性 (consistency_score)', desc: '是否保持人设/世界观/剧情/事实一致，记忆连贯 (1-10分)' },
  { key: 'immersion_score', title: '沉浸感 (immersion_score)', desc: '是否传达合适的情绪和氛围 (1-10分)' },
  { key: 'progression_score', title: '推进度 (progression_score)', desc: '是否推动剧情并提供勾子 (1-10分)' },
  { key: 'novelty_score', title: '新颖度 (novelty_score)', desc: '是否表达多样且有趣，不模板化 (1-10分)' },
  { key: 'satisfaction_score', title: '满意度 (satisfaction_score)', desc: '是否让用户获得价值与满足 (1-10分)' }
]

export default function ScoreSummaryPage() {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - 6)

  const [startDate] = useState<string>(formatDate(start))
  const [endDate] = useState<string>(formatDate(today))
  const [loading, setLoading] = useState<boolean>(false)
  const [seriesByType, setSeriesByType] = useState<Record<ScoreKey, { label: string; value: number }[]>>({} as any)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const json = await getChatQualityStatsRange(startDate, endDate)
        if (!cancelled && json?.success) {
          const sorted = [...(json.data || [])].sort((a: any, b: any) => String(a.stat_date).localeCompare(String(b.stat_date)))
          const byType: Record<ScoreKey, { label: string; value: number }[]> = {} as any
          METRICS.forEach(m => {
            byType[m.key] = sorted.map((d: any) => {
              const ss = d?.score_summary || {}
              const dims = ss?.dimension_averages || {}
              const v = m.key === 'overall_score' ? ss?.overall_score : dims?.[m.key]
              return { label: d.stat_date, value: clamp(Number(v) || 0, 0, 10) }
            })
          })
          setSeriesByType(byType)
        }
      } catch (e) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [startDate, endDate])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card bordered={false} style={{ boxShadow: 'var(--semi-shadow-elevated)' }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Typography.Text type="tertiary">展示区间：{startDate} ~ {endDate}（默认近7天）</Typography.Text>
          <Typography.Text type="tertiary">数据源：/api/chat-quality-stats/range</Typography.Text>
        </Space>
      </Card>

      <Row gutter={16}>
        {METRICS.map(m => (
          <Col key={m.key} span={8}>
            <Card bordered={false} title={<Typography.Title heading={5} style={{ margin: 0 }}>{m.title}</Typography.Title>}>
              <ScoreChart loading={loading} data={seriesByType[m.key] || []} />
              {m.desc ? <Typography.Text type="tertiary">{m.desc}</Typography.Text> : null}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

function ScoreChart({ data, loading }: { data: { label: string; value: number }[]; loading?: boolean }) {
  const series = useMemo(() => {
    return (data || []).map(d => ({ label: d.label, value: clamp(d.value, 0, 10) }))
  }, [data])
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ height: 300, borderRadius: 8, background: 'var(--semi-color-fill-0)' }} />
      </div>
    )
  }
  if (!series.length) return <Typography.Text type="tertiary">暂无数据</Typography.Text>

  const values = series.map(d => d.value)
  const rawMin = values.length ? Math.min(...values) : 0
  const rawMax = values.length ? Math.max(...values) : 10
  const range = Math.max(1e-6, rawMax - rawMin)
  const pad = Math.max(0.2, range * 0.15)
  const minY = Math.max(0, rawMin - pad)
  const maxY = Math.min(10, rawMax + pad)
  const makeTicks = (min: number, max: number, count = 5) => Array.from({ length: count }, (_, i) => min + (i / (count - 1)) * (max - min))
  const fmtScore = (v: number) => v.toFixed(1)

  const width = 1000
  const height = 300
  const padding = { left: 44, right: 12, top: 18, bottom: 34 }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const n = series.length

  const xAt = (i: number) => n === 1 ? padding.left + innerW / 2 : padding.left + (i / (n - 1)) * innerW
  const yAt = (v: number) => padding.top + innerH - ((v - minY) / (maxY - minY)) * innerH

  const step = innerW / Math.max(n, 1)
  const barWidth = Math.max(4, step * 0.6)
  const barXAt = (i: number) => padding.left + i * step + (step - barWidth) / 2
  const lineXAt = (i: number) => padding.left + i * step + step / 2

  const points = series.map((d, i) => ({ x: lineXAt(i), y: yAt(Math.max(0, Math.min(10, d.value))) }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  const last = series[series.length - 1]
  const prev = series[series.length - 2] || last
  const lastDelta = last.value - prev.value
  const lastColor = last.value >= 8 ? 'var(--semi-color-success)' : last.value >= 6 ? 'var(--semi-color-warning)' : 'var(--semi-color-danger)'
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
        <Typography.Text type="tertiary">每日评分</Typography.Text>
        <Space>
          <Typography.Text>当前值 {last.value.toFixed(2)}</Typography.Text>
          <Tag size="small" color={lastDelta >= 0 ? 'green' : 'red'} type="light">{lastDelta >= 0 ? '+' : ''}{lastDelta.toFixed(2)}</Tag>
        </Space>
      </Space>

      <div style={{ width: '100%', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: 300 }}
          onMouseMove={(e) => {
            const svg = (e.currentTarget as SVGSVGElement)
            const rect = svg.getBoundingClientRect()
            const x = e.clientX - rect.left
            const ix = Math.floor((x - padding.left) / step)
            const clamped = Math.max(0, Math.min(n - 1, ix))
            if (!Number.isNaN(clamped)) setHoverIndex(clamped)
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="ss-bar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={barColor} stopOpacity="0.55" />
              <stop offset="100%" stopColor={barColor} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <rect x={padding.left} y={padding.top} width={innerW} height={innerH} rx="8" fill="var(--semi-color-bg-0)" />
          {makeTicks(minY, maxY, 5).map((t, i) => (
            <g key={i}>
              <line x1={padding.left} x2={padding.left + innerW} y1={yAt(t)} y2={yAt(t)} stroke={gridColor} strokeOpacity="0.35" strokeWidth="1" />
              <text x={padding.left - 8} y={yAt(t)} dominantBaseline="middle" textAnchor="end" fontSize="14" fontWeight={600} fill={axisText}>
                {fmtScore(t)}
              </text>
            </g>
          ))}

          {series.map((d, i) => {
            const x = barXAt(i)
            const y = yAt(Math.max(0, Math.min(10, d.value)))
            const h = padding.top + innerH - y
            return (
              <rect key={`bar-${i}`} x={x} y={y} width={barWidth} height={Math.max(1, h)} fill="url(#ss-bar)" rx="2" />
            )
          })}

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
                    <text x={tx + 10} y={ty + 36} fontSize="16" fontWeight={700} fill={lastColor}>{series[hi].value.toFixed(2)}</text>
                  </g>
                )
              })()}
            </g>
          )}

          {series.map((d, i) => (
            <text key={i} x={lineXAt(i)} y={height - 8} dominantBaseline="ideographic" textAnchor="middle" fontSize="14" fill={axisText}>
              {truncate(d.label, 14)}
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


