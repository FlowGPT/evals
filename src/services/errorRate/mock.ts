import type { FilterState, MetricKey, MetricRow } from '@/types/errorRate'

const MODELS = ['gpt-4o', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4o-mini']
const LANGS = ['en', 'zh', 'ja', 'de']
const COUNTRIES = ['US', 'CN', 'JP', 'DE']
const GENDERS = ['male', 'female']

export async function mockFetchErrorRates(
  filters: FilterState
): Promise<Record<MetricKey, MetricRow[]>> {
  await new Promise((r) => setTimeout(r, 400))
  const dims = filters.breakdownDims
  const rows: MetricRow[] = []

  const models = filters.models.length ? filters.models : MODELS
  const languages = filters.language === 'all' ? LANGS : [filters.language]
  const countries = filters.country === 'all' ? COUNTRIES : [filters.country]
  const genders = filters.gender === 'all' ? GENDERS : [filters.gender]

  for (const m of dims.includes('model') ? models : ['']) {
    for (const l of dims.includes('language') ? languages : ['']) {
      for (const c of dims.includes('country') ? countries : ['']) {
        for (const g of dims.includes('gender') ? genders : ['']) {
          const base = seedToRate(`${m}-${l}-${c}-${g}`)
          rows.push({
            dimValues: {
              ...(m && { model: m }),
              ...(l && { language: l }),
              ...(c && { country: c }),
              ...(g && { gender: g }),
            },
            value: base,
            delta: (Math.random() - 0.5) * 0.05,
          })
        }
      }
    }
  }

  const result: Record<MetricKey, MetricRow[]> = {
    input_error_rate: jitter(rows, 0.9),
    output_error_rate: jitter(rows, 1.0),
    timeout_rate: jitter(rows, 0.5),
    rate_limit_error_rate: jitter(rows, 0.3),
  }
  return result
}

function jitter(rows: MetricRow[], scale: number): MetricRow[] {
  return rows.map((r) => ({
    ...r,
    value: clamp(r.value * scale + (Math.random() - 0.5) * 0.02, 0, 1),
  }))
}

function seedToRate(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return clamp(((h % 1000) / 1000) * 0.15 + 0.02, 0, 1)
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
