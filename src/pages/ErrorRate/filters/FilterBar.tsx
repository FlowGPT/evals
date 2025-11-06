import { Button, Col, DatePicker, Select, Space, TagInput } from '@douyinfe/semi-ui'
import type { FilterState } from '@/types/errorRate'
import { IconFilter } from '@douyinfe/semi-icons'

interface Props {
  value: FilterState
  onChange: (next: FilterState) => void
}

const MODEL_OPTIONS = ['gpt-4o', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4o-mini']
const LANGUAGE_OPTIONS = ['all', 'en', 'zh', 'ja', 'de', 'fr']
const COUNTRY_OPTIONS = ['all', 'US', 'CN', 'JP', 'DE', 'FR']

export function FilterBar({ value, onChange }: Props) {
  return (
    <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
      <Space wrap>
        <TagInput
          defaultValue={value.models}
          onChange={(v) => onChange({ ...value, models: v as string[] })}
          placeholder="选择/输入模型，可多选"
          allowDuplicates={false}
          style={{ width: 320 }}
        />
        <Select
          style={{ width: 160 }}
          value={value.period}
          onChange={(v) => onChange({ ...value, period: v as any })}
          optionList={[
            { label: '近24小时', value: '24h' },
            { label: '近7天', value: '7d' },
            { label: '近30天', value: '30d' },
            { label: '自定义', value: 'custom' }
          ]}
        />
        {value.period === 'custom' && (
          <DatePicker
            type="dateRange"
            style={{ width: 260 }}
            onChange={(v: any) => onChange({ ...value, dateRange: v ? [v[0]?.toString()!, v[1]?.toString()!] : null })}
          />
        )}
        <Select
          style={{ width: 140 }}
          value={value.language}
          onChange={(v) => onChange({ ...value, language: v as any })}
          optionList={LANGUAGE_OPTIONS.map(l => ({ label: l.toUpperCase(), value: l }))}
        />
        <Select
          style={{ width: 140 }}
          value={value.country}
          onChange={(v) => onChange({ ...value, country: v as any })}
          optionList={COUNTRY_OPTIONS.map(c => ({ label: c, value: c }))}
        />
        <Select
          style={{ width: 140 }}
          value={value.gender}
          onChange={(v) => onChange({ ...value, gender: v as any })}
          optionList={[{ label: '全部', value: 'all' }, { label: '男', value: 'male' }, { label: '女', value: 'female' }, { label: '其他', value: 'other' }]}
        />
      </Space>
      <Space>
        <BreakdownSelect value={value.breakdownDims} onChange={(dims) => onChange({ ...value, breakdownDims: dims })} />
        <Button icon={<IconFilter />} onClick={() => onChange({ ...value })}>筛选</Button>
      </Space>
    </Space>
  )
}

function BreakdownSelect({ value, onChange }: { value: FilterState['breakdownDims']; onChange: (dims: FilterState['breakdownDims']) => void }) {
  return (
    <Select
      multiple
      maxTagCount={3}
      style={{ width: 260 }}
      value={value}
      onChange={(v) => onChange(v as any)}
      optionList={[
        { label: '模型', value: 'model' },
        { label: '语种', value: 'language' },
        { label: '国家', value: 'country' },
        { label: '性别', value: 'gender' }
      ]}
      placeholder="Breakdown by..."
    />
  )
}


