import React from 'react'
import { addHours, startOfDay, differenceInCalendarDays, parseISO } from 'date-fns'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { localeForLanguage } from '../../../../../util/languageUtils'
import { capitalizeString } from './utils'
import { focusIndicatorStyle } from '../../../../../util/accessibility'

const summaryStyle = {
  cursor: 'pointer',
  p: 1,
  borderRadius: 1,
  width: 'fit-content',
  ...focusIndicatorStyle(),
}

// Build per-day counts using noon buckets, returned as sorted array [{ x: middayTs, count }]
const groupFeedbacksByDay = (feedbacks: Array<{ createdAt: string }>) => {
  const byDayObj: Record<number, number> = {}
  for (let i = 0; i < feedbacks.length; i++) {
    const f = feedbacks[i]
    const t = addHours(startOfDay(typeof f.createdAt === 'string' ? Date.parse(f.createdAt) : (f as any)), 12).getTime()
    byDayObj[t] = (byDayObj[t] ?? 0) + 1
  }
  const entries = Object.keys(byDayObj)
    .map(k => ({ x: Number(k), count: byDayObj[Number(k)] }))
    .sort((a, b) => a.x - b.x)
  return entries
}

// Build contiguous daily rows; range is expanded to include pre-open and post-close feedbacks
export const buildDailySeries = (
  opensAt: string | number | Date,
  closesAt: string | number | Date,
  feedbacks: Array<{ createdAt: string }>,
  studentCount: number,
  localeCode?: string
) => {
  const open = startOfDay(typeof opensAt === 'string' ? parseISO(opensAt) : new Date(opensAt))
  const close = startOfDay(typeof closesAt === 'string' ? parseISO(closesAt) : new Date(closesAt))

  const byDay = groupFeedbacksByDay(feedbacks)

  const firstFeedbackDay = byDay.length > 0 ? startOfDay(new Date(byDay[0].x)) : null
  const lastFeedbackDay = byDay.length > 0 ? startOfDay(new Date(byDay[byDay.length - 1].x)) : null

  const start = firstFeedbackDay && firstFeedbackDay.getTime() < open.getTime() ? firstFeedbackDay : open
  const end = lastFeedbackDay && lastFeedbackDay.getTime() > close.getTime() ? lastFeedbackDay : close

  const byDayMap: Record<number, number> = {}
  for (let i = 0; i < byDay.length; i++) {
    const d = byDay[i]
    const dayKey = startOfDay(new Date(d.x)).getTime()
    byDayMap[dayKey] = d.count
  }

  const totalDays = Math.max(0, differenceInCalendarDays(end, start)) + 1

  const rows: Array<{
    date: Date
    dailyCount: number
    cumulativeCount: number
    cumulativePct: number
    label: string
  }> = []

  let cumulative = 0
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const dayKey = startOfDay(date).getTime()
    const count = byDayMap[dayKey] ?? 0
    cumulative += count
    const pct = studentCount > 0 ? (cumulative / studentCount) * 100 : 0
    rows.push({
      date,
      dailyCount: count,
      cumulativeCount: cumulative,
      cumulativePct: pct,
      label: date.toLocaleDateString(localeCode),
    })
  }

  return rows
}

type DailyRow = ReturnType<typeof buildDailySeries>[number]

const groupByMonth = (rows: DailyRow[]) => {
  const groups: Record<string, DailyRow[]> = {}
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const y = r.date.getFullYear()
    const m = r.date.getMonth() + 1
    const key = `${y}-${String(m).padStart(2, '0')}`
    if (!groups[key]) groups[key] = []
    groups[key].push(r)
  }
  return groups
}

export const DailyCumulativeTable = ({ rows, studentCount }: { rows: DailyRow[]; studentCount: number }) => {
  const { t } = useTranslation()

  return (
    <TableContainer sx={{ mb: 2 }}>
      <Table
        size="small"
        sx={{
          '& thead': { backgroundColor: 'action.hover' },
        }}
      >
        <caption
          style={{
            captionSide: 'top',
            textAlign: 'left',
            fontSize: '1rem',
            fontWeight: 'bold',
            padding: '0.5rem 0',
          }}
        >
          {t('feedbackTargetResults:dailyBreakdown')}
        </caption>
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col" sx={{ fontWeight: 'bold' }}>
              {t('feedbackTargetResults:date')}
            </TableCell>
            <TableCell component="th" scope="col" align="right" sx={{ fontWeight: 'bold' }}>
              {t('feedbackTargetResults:dailyCount')}
            </TableCell>
            <TableCell component="th" scope="col" align="right" sx={{ fontWeight: 'bold' }}>
              {t('feedbackTargetResults:cumulative')}
            </TableCell>
            <TableCell component="th" scope="col" align="right" sx={{ fontWeight: 'bold' }}>
              {t('feedbackTargetResults:percentage')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.date.toISOString()} hover>
              <TableCell component="th" scope="row">
                {r.label}
              </TableCell>
              <TableCell align="right">{r.dailyCount}</TableCell>
              <TableCell align="right">{r.cumulativeCount}</TableCell>
              <TableCell align="right">{studentCount > 0 ? `${r.cumulativePct.toFixed(1)} %` : '0.0 %'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export const MonthlyExpandableTables = ({
  rows,
  studentCount,
  language,
}: {
  rows: DailyRow[]
  studentCount: number
  language: string
}) => {
  const { t } = useTranslation()
  const localeCode = localeForLanguage(language)?.code
  const byMonth = groupByMonth(rows)
  const monthKeys = Object.keys(byMonth).sort((a, b) => (a < b ? -1 : 1))

  return (
    <div>
      {monthKeys.map(key => {
        const [y, m] = key.split('-').map(Number)
        const monthRows = byMonth[key] ?? []
        const monthTotal = monthRows.reduce((acc, r) => acc + r.dailyCount, 0)
        const monthLabel = new Date(y, m - 1, 1).toLocaleDateString(localeCode, {
          year: 'numeric',
          month: 'long',
        })
        const captionId = `caption-${key}`
        const detailsId = `details-${key}`

        return (
          <div key={key}>
            <details id={detailsId}>
              <Typography
                component="summary"
                variant="subtitle1"
                sx={summaryStyle}
                aria-describedby={captionId}
                aria-controls={`${detailsId}-table`}
              >
                {`${capitalizeString(monthLabel)}: ${monthTotal} ${t('feedbackTargetResults:feedbacks')}`}
              </Typography>
              <TableContainer sx={{ mb: 3 }}>
                <Table
                  id={`${detailsId}-table`}
                  size="small"
                  aria-describedby={captionId}
                  sx={{
                    '& thead': { backgroundColor: 'action.hover' },
                  }}
                >
                  <caption
                    id={captionId}
                    style={{
                      captionSide: 'top',
                      textAlign: 'left',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      padding: '0.5rem 0',
                    }}
                  >
                    {t('feedbackTargetResults:dailyBreakdown')}
                  </caption>
                  <TableHead>
                    <TableRow>
                      <TableCell component="th" scope="col" sx={{ fontWeight: 'bold' }}>
                        {t('feedbackTargetResults:date', { defaultValue: 'Date' })}
                      </TableCell>
                      <TableCell component="th" scope="col" align="right" sx={{ fontWeight: 'bold' }}>
                        {t('feedbackTargetResults:dailyCount', { defaultValue: 'Daily responses' })}
                      </TableCell>
                      <TableCell component="th" scope="col" align="right" sx={{ fontWeight: 'bold' }}>
                        {t('feedbackTargetResults:cumulative', { defaultValue: 'Cumulative responses' })}
                      </TableCell>
                      <TableCell component="th" scope="col" align="right" sx={{ fontWeight: 'bold' }}>
                        {t('feedbackTargetResults:percentage', { defaultValue: 'Cumulative %' })}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthRows.map(r => (
                      <TableRow key={r.date.toISOString()} hover>
                        <TableCell component="th" scope="row">
                          {r.label}
                        </TableCell>
                        <TableCell align="right">{r.dailyCount}</TableCell>
                        <TableCell align="right">{r.cumulativeCount}</TableCell>
                        <TableCell align="right">
                          {studentCount > 0 ? `${r.cumulativePct.toFixed(1)} %` : '0.0 %'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </details>
          </div>
        )
      })}
    </div>
  )
}
