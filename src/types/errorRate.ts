export type PeriodKey = '24h' | '7d' | '30d' | 'custom'
export type Dim = 'model' | 'language' | 'country' | 'gender'
export type MetricKey =
  | 'input_error_rate'
  | 'output_error_rate'
  | 'timeout_rate'
  | 'rate_limit_error_rate'

export interface FilterState {
  models: string[]
  period: PeriodKey
  dateRange: [string, string] | null
  language: 'all' | string
  country: 'all' | string
  gender: 'all' | 'male' | 'female' | 'other'
  breakdownDims: Dim[]
}

export interface MetricRow {
  dimValues: Partial<Record<Dim, string>>
  value: number
  delta?: number
}
