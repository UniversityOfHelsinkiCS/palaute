import type {
  GetHelpChatbotUsageQuery,
  GetHelpChatbotUsageResponse,
  HelpChatbotPrice,
  HelpChatbotUsage,
  HelpChatbotUsageGrouping,
} from '@common/types/helpChatbotAdmin'
import type { Theme } from '@mui/material'
import type { SystemStyleObject } from '@mui/system'
import type { ReactNode } from 'react'

import {
  Alert,
  Box,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'

import type { UsageMetric } from './UsageChart'

import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { NorButton } from '../../../../components/common/NorButton'
import { useHelpChatbotUsage } from './api'
import { formatDate, formatDuration, formatEuros, formatNumber, formatPercent, shortSha } from './format'
import UsageChart from './UsageChart'
import useUrlFilters, { daysAgo, today } from './useUrlFilters'

const GROUPINGS: HelpChatbotUsageGrouping[] = ['day', 'week', 'month']
const METRICS: UsageMetric[] = ['questions', 'tokens', 'cost']

const isGrouping = (value: string | undefined): value is HelpChatbotUsageGrouping => GROUPINGS.some(g => g === value)
const isMetric = (value: string | undefined): value is UsageMetric => METRICS.some(m => m === value)

const DEFAULT_DAYS = 30

const average = (total: number, count: number) => (count === 0 ? '–' : formatNumber(total / count))

const problems = (usage: HelpChatbotUsage) => usage.empty + usage.failed + usage.aborted + usage.pending

const csvCell = (value: string | number | null) => {
  const text = value === null ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const downloadCsv = (usage: GetHelpChatbotUsageResponse, query: GetHelpChatbotUsageQuery) => {
  const header = [
    'period start',
    'questions',
    'answered',
    'empty',
    'failed',
    'aborted',
    'thumbs up',
    'thumbs down',
    'input tokens',
    'cached input tokens',
    'output tokens',
    'reasoning tokens',
    'uncached input cost €',
    'cached input cost €',
    'output cost € (without reasoning)',
    'reasoning cost €',
    'total cost €',
    'unpriced turns',
  ]
  const rows = usage.periods.map(p => [
    p.start,
    p.questions,
    p.answered,
    p.empty,
    p.failed,
    p.aborted,
    p.up,
    p.down,
    p.promptTokens,
    p.cachedTokens,
    p.completionTokens,
    p.reasoningTokens,
    p.cost.input,
    p.cost.cachedInput,
    p.cost.output,
    p.cost.reasoning,
    p.cost.total,
    p.cost.unpricedTurns,
  ])
  const csv = [header, ...rows].map(row => row.map(csvCell).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `norppai-usage-${query.from}-${query.to}-by-${query.groupBy}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const Tile = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
  <Paper variant="outlined" sx={{ p: '12px 14px' }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{value}</Typography>
    <Typography variant="body2" color="text.secondary">
      {detail}
    </Typography>
  </Paper>
)

const Section = ({ title, description, children }: { title: string; description?: string; children: ReactNode }) => (
  <Paper variant="outlined" component="section" aria-label={title} sx={{ mb: 2 }}>
    <Box sx={{ p: '12px 16px', borderBottom: 1, borderColor: 'divider' }}>
      <Typography component="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
    {children}
  </Paper>
)

const NUMERIC: SystemStyleObject<Theme> = {
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
}

const CostBreakdown = ({ totals }: { totals: HelpChatbotUsage }) => {
  const rows = [
    { label: 'Uncached input', tokens: totals.promptTokens - totals.cachedTokens, cost: totals.cost.input },
    { label: 'Cached input', tokens: totals.cachedTokens, cost: totals.cost.cachedInput },
    { label: 'Output', tokens: totals.completionTokens - totals.reasoningTokens, cost: totals.cost.output },
    { label: 'Reasoning', tokens: totals.reasoningTokens, cost: totals.cost.reasoning },
  ]
  return (
    <TableContainer>
      <Table size="small" aria-label="Cost by token type">
        <TableHead>
          <TableRow>
            <TableCell>Tokens</TableCell>
            <TableCell sx={NUMERIC}>Count</TableCell>
            <TableCell sx={NUMERIC}>Cost</TableCell>
            <TableCell sx={NUMERIC}>Share</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.label}>
              <TableCell>{row.label}</TableCell>
              <TableCell sx={NUMERIC}>{formatNumber(row.tokens)}</TableCell>
              <TableCell sx={NUMERIC}>{formatEuros(row.cost)}</TableCell>
              <TableCell sx={NUMERIC}>{formatPercent(row.cost, totals.cost.total)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
            <TableCell sx={{ ...NUMERIC, fontWeight: 700 }}>
              {formatNumber(totals.promptTokens + totals.completionTokens)}
            </TableCell>
            <TableCell sx={{ ...NUMERIC, fontWeight: 700 }}>{formatEuros(totals.cost.total)}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const PriceTable = ({ prices }: { prices: HelpChatbotPrice[] }) => (
  <TableContainer>
    <Table size="small" aria-label="Prices">
      <TableHead>
        <TableRow>
          <TableCell>Model</TableCell>
          <TableCell>Valid</TableCell>
          <TableCell sx={NUMERIC}>Input</TableCell>
          <TableCell sx={NUMERIC}>Cached input</TableCell>
          <TableCell sx={NUMERIC}>Output</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {prices.map(price => (
          <TableRow key={`${price.family}:${price.validFrom}`}>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{price.family}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
              {formatDate(price.validFrom)} – {price.validTo ? formatDate(price.validTo) : 'now'}
            </TableCell>
            <TableCell sx={NUMERIC}>{price.input.toFixed(2)}</TableCell>
            <TableCell sx={NUMERIC}>{price.cachedInput.toFixed(2)}</TableCell>
            <TableCell sx={NUMERIC}>{price.output.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

const VersionTable = ({ versions }: { versions: GetHelpChatbotUsageResponse['versions'] }) => (
  <TableContainer>
    <Table size="small" aria-label="Usage by version" sx={{ minWidth: 1000 }}>
      <TableHead>
        <TableRow>
          <TableCell>Version</TableCell>
          <TableCell>Models</TableCell>
          <TableCell>In use</TableCell>
          <TableCell sx={NUMERIC}>Questions</TableCell>
          <TableCell sx={NUMERIC}>Answered</TableCell>
          <TableCell sx={NUMERIC}>Up / down</TableCell>
          <TableCell sx={NUMERIC}>Avg in / cached</TableCell>
          <TableCell sx={NUMERIC}>Avg out / reasoning</TableCell>
          <TableCell sx={NUMERIC}>Avg time</TableCell>
          <TableCell sx={NUMERIC}>Cost / question</TableCell>
          <TableCell sx={NUMERIC}>Cost</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {versions.map(version => (
          <TableRow key={version.gitSha ?? 'development'}>
            <TableCell sx={{ fontFamily: 'monospace' }}>{shortSha(version.gitSha)}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{version.models.join(', ') || '–'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
              {formatDate(version.firstAt)} – {formatDate(version.lastAt)}
            </TableCell>
            <TableCell sx={NUMERIC}>{version.questions}</TableCell>
            <TableCell sx={NUMERIC}>{formatPercent(version.answered, version.questions)}</TableCell>
            <TableCell sx={NUMERIC}>
              {version.up} / {version.down}
            </TableCell>
            <TableCell sx={NUMERIC}>
              {average(version.promptTokens, version.billed)} / {average(version.cachedTokens, version.billed)}
            </TableCell>
            <TableCell sx={NUMERIC}>
              {average(version.completionTokens, version.billed)} / {average(version.reasoningTokens, version.billed)}
            </TableCell>
            <TableCell sx={NUMERIC}>{formatDuration(version.avgDurationMs)}</TableCell>
            <TableCell sx={NUMERIC}>
              {version.questions === 0 ? '–' : formatEuros(version.cost.total / version.questions)}
            </TableCell>
            <TableCell sx={NUMERIC}>{formatEuros(version.cost.total)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

// Volume, problems, feedback and cost over a date range, by period and by deployed version
const UsageView = () => {
  const { get, set } = useUrlFilters()
  const groupBy = get('groupBy')
  const metric = get('show')
  const query: GetHelpChatbotUsageQuery = {
    from: get('from') ?? daysAgo(DEFAULT_DAYS - 1),
    to: get('to') ?? today(),
    groupBy: isGrouping(groupBy) ? groupBy : 'day',
  }
  const shownMetric = isMetric(metric) ? metric : 'questions'
  const { data: usage, isLoading, isError, isFetching } = useHelpChatbotUsage(query)

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, p: 1.5, mb: 2 }}
      >
        <TextField
          label="From"
          type="date"
          size="small"
          value={query.from}
          onChange={event => set({ from: event.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="To"
          type="date"
          size="small"
          value={query.to}
          onChange={event => set({ to: event.target.value || undefined })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          select
          label="Group by"
          size="small"
          value={query.groupBy}
          onChange={event => set({ groupBy: event.target.value === 'day' ? undefined : event.target.value })}
          sx={{ minWidth: 120 }}
        >
          {GROUPINGS.map(grouping => (
            <MenuItem key={grouping} value={grouping}>
              {grouping[0].toUpperCase() + grouping.slice(1)}
            </MenuItem>
          ))}
        </TextField>
        <NorButton
          color="secondary"
          sx={{ ml: 'auto' }}
          disabled={!usage}
          onClick={() => usage && downloadCsv(usage, query)}
        >
          Download CSV
        </NorButton>
      </Paper>

      {isLoading && <LoadingProgress />}
      {isError && <Alert severity="error">The usage couldn&apos;t be loaded.</Alert>}
      {usage && (
        <Box sx={{ opacity: isFetching ? 0.6 : 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1.25, mb: 2 }}>
            <Tile
              label="Questions"
              value={formatNumber(usage.totals.questions)}
              detail={`in ${formatNumber(usage.totals.conversations)} conversations`}
            />
            <Tile
              label="Answered"
              value={formatPercent(usage.totals.answered, usage.totals.questions)}
              detail={`${formatNumber(usage.totals.answered)} answered`}
            />
            <Tile
              label="Problems"
              value={formatNumber(problems(usage.totals))}
              detail={`${usage.totals.empty} empty · ${usage.totals.failed} failed · ${usage.totals.aborted} aborted`}
            />
            <Tile
              label="Feedback (up / down)"
              value={`${usage.totals.up} / ${usage.totals.down}`}
              detail={`${formatPercent(usage.totals.up + usage.totals.down, usage.totals.answered)} of answers rated`}
            />
            <Tile
              label="Tokens"
              value={formatNumber(usage.totals.promptTokens + usage.totals.completionTokens)}
              detail={`${formatNumber(usage.totals.cachedTokens)} cached · ${formatNumber(usage.totals.reasoningTokens)} reasoning`}
            />
            <Tile
              label="Cost"
              value={formatEuros(usage.totals.cost.total)}
              detail={
                usage.totals.cost.unpricedTurns > 0
                  ? `${usage.totals.cost.unpricedTurns} turns have no price and aren't included`
                  : `${usage.totals.questions === 0 ? '–' : formatEuros(usage.totals.cost.total / usage.totals.questions)} per question`
              }
            />
          </Box>

          <Section title={`Per ${query.groupBy}`} description="Days are in Helsinki time; weeks start on Monday.">
            <Box sx={{ p: '8px 16px 0' }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                aria-label="Show"
                value={shownMetric}
                onChange={(_, value: UsageMetric | null) =>
                  value && set({ show: value === 'questions' ? undefined : value })
                }
              >
                {METRICS.map(option => (
                  <ToggleButton key={option} value={option} sx={{ textTransform: 'none', px: 1.5 }}>
                    {option[0].toUpperCase() + option.slice(1)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ height: 280, p: 2 }}>
              <UsageChart periods={usage.periods} groupBy={query.groupBy ?? 'day'} metric={shownMetric} />
            </Box>
          </Section>

          <Section
            title="By version"
            description="One row per deployed commit, newest first, so the effect of a prompt change shows directly. Averages are per answer the model returned."
          >
            <VersionTable versions={usage.versions} />
          </Section>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ flex: '1 1 420px', minWidth: 0 }}>
              <Section
                title="Cost"
                description="Requests the user aborted have no usage, so the cost is a slight undercount."
              >
                <CostBreakdown totals={usage.totals} />
              </Section>
            </Box>
            <Box sx={{ flex: '1 1 520px', minWidth: 0 }}>
              <Section
                title="Prices"
                description="Euros per million tokens; reasoning is billed as output. Each question is priced with the price valid when it was asked. Set in src/server/services/helpChatbotAdmin/prices.ts."
              >
                <PriceTable prices={usage.prices} />
              </Section>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default UsageView
