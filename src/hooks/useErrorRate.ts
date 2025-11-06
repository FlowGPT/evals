import { useEffect, useMemo, useState } from 'react'
import type { FilterState, MetricKey, MetricRow } from '@/types/errorRate'
import { mockFetchErrorRates } from '@/services/errorRate/mock'

export function useErrorRate(filters: FilterState) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Record<MetricKey, MetricRow[]>>({
    input_error_rate: [],
    output_error_rate: [],
    timeout_rate: [],
    rate_limit_error_rate: [],
  })

  useEffect(() => {
    let aborted = false
    setLoading(true)
    mockFetchErrorRates(filters)
      .then((res) => {
        if (!aborted) setData(res)
      })
      .finally(() => !aborted && setLoading(false))
    return () => {
      aborted = true
    }
  }, [JSON.stringify(filters)])

  const dataByMetric = useMemo(() => data, [data])

  return { loading, dataByMetric }
}
