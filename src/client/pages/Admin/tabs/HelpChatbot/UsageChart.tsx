import type { GetHelpChatbotUsageResponse, HelpChatbotUsageGrouping } from '@common/types/helpChatbotAdmin'

import 'chart.js/auto'
import { useTheme } from '@mui/material'
import { format } from 'date-fns'
import { Bar } from 'react-chartjs-2'

import { formatEuros, formatNumber } from './format'

export type UsageMetric = 'questions' | 'tokens' | 'cost'

const PERIOD_FORMATS: Record<HelpChatbotUsageGrouping, string> = {
  day: 'd MMM',
  week: "'Week of' d MMM",
  month: 'MMM yyyy',
}

type UsageChartProps = {
  periods: GetHelpChatbotUsageResponse['periods']
  groupBy: HelpChatbotUsageGrouping
  metric: UsageMetric
}

// The per-period numbers aren't in any table; the CSV download is the chart's text alternative
const UsageChart = ({ periods, groupBy, metric }: UsageChartProps) => {
  const theme = useTheme()
  const labels = periods.map(period => format(new Date(`${period.start}T00:00:00`), PERIOD_FORMATS[groupBy]))
  // Told apart by lightness as well as hue: input in blues, output in oranges
  const colors =
    metric === 'questions'
      ? [theme.palette.primary.main, theme.palette.warning.main]
      : [
          theme.palette.primary.dark,
          theme.palette.primary.light,
          theme.palette.warning.main,
          theme.palette.warning.dark,
        ]

  const series = {
    questions: [
      { label: 'Answered', data: periods.map(p => p.answered) },
      { label: 'Empty, failed or aborted', data: periods.map(p => p.empty + p.failed + p.aborted + p.pending) },
    ],
    tokens: [
      { label: 'Uncached input', data: periods.map(p => p.promptTokens - p.cachedTokens) },
      { label: 'Cached input', data: periods.map(p => p.cachedTokens) },
      { label: 'Output', data: periods.map(p => p.completionTokens - p.reasoningTokens) },
      { label: 'Reasoning', data: periods.map(p => p.reasoningTokens) },
    ],
    cost: [
      { label: 'Uncached input', data: periods.map(p => p.cost.input) },
      { label: 'Cached input', data: periods.map(p => p.cost.cachedInput) },
      { label: 'Output', data: periods.map(p => p.cost.output) },
      { label: 'Reasoning', data: periods.map(p => p.cost.reasoning) },
    ],
  }[metric]

  const formatValue = (value: number) => (metric === 'cost' ? formatEuros(value) : formatNumber(value))

  return (
    <Bar
      aria-label={`${metric} per ${groupBy}, as a stacked bar chart`}
      role="img"
      height={260}
      data={{
        labels,
        datasets: series.map((dataset, i) => ({ ...dataset, backgroundColor: colors[i], borderRadius: 2 })),
      }}
      options={{
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, ticks: { callback: value => formatValue(Number(value)) } },
        },
        plugins: {
          legend: { position: 'top', align: 'end' },
          tooltip: { callbacks: { label: item => `${item.dataset.label}: ${formatValue(Number(item.raw))}` } },
          datalabels: { display: false },
        },
      }}
    />
  )
}

export default UsageChart
