import { Box, Tooltip } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { ResultQuestion } from './blocks'

import { getColor } from '../../../../../util/resultColors'
import AverageResult, { getMean } from '../QuestionResults/AverageResult'
import { formatPercent, LIKERT_VALUES } from './counts'

const COLUMN_HEIGHT = 88
// Lines across the columns at each quarter of the tallest column of the table
const GRID_LINES = 4
// The middle of the scale line from the top of its row
const LINE_CENTER = 5
const CARET_WIDTH = 5
const CARET_HEIGHT = 6
// Between the line and the tip of the caret, as much as between the numbers and the tops of the notches
const CARET_GAP = 4
const MEAN_SIZE = '2.25rem'
const TOOLTIP_MODIFIERS = [{ name: 'offset', options: { offset: [0, -8] } }]

// The five values take equal slots, a value sitting in the middle of its slot
const valuePosition = (value: number) => `${((value - 0.5) / LIKERT_VALUES.length) * 100}%`

type LikertColumnProps = {
  gridColumn: number
  name: string
  count: number
  tooltip: string
  height: number
  color: string
}

// The whole slot of the column shows its tooltip, which sits above the count of the column
const LikertColumn = ({ gridColumn, name, count, tooltip, height, color }: LikertColumnProps) => {
  const [countElement, setCountElement] = useState<HTMLElement | null>(null)

  return (
    <Tooltip
      title={tooltip}
      placement="top"
      slotProps={{ popper: { anchorEl: countElement, modifiers: TOOLTIP_MODIFIERS } }}
    >
      <Box
        sx={{
          gridColumn,
          gridRow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          typography: 'body2',
          lineHeight: 1.3,
        }}
      >
        <Box
          sx={{
            alignSelf: 'stretch',
            height: COLUMN_HEIGHT + 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'text.disabled',
            backgroundImage: theme =>
              `repeating-linear-gradient(to top, transparent 0 ${COLUMN_HEIGHT / GRID_LINES - 1}px, ${alpha(
                theme.palette.text.primary,
                0.07
              )} ${COLUMN_HEIGHT / GRID_LINES - 1}px ${COLUMN_HEIGHT / GRID_LINES}px)`,
            backgroundSize: `100% ${COLUMN_HEIGHT}px`,
            backgroundPosition: 'bottom',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <Box ref={setCountElement} sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {count}
          </Box>
          <Box
            sx={{
              width: '2.25rem',
              height: `${height}px`,
              borderRadius: '2px 2px 0 0',
              backgroundColor: color,
              printColorAdjust: 'exact',
            }}
          />
        </Box>
        <Box sx={{ typography: 'caption', color: 'text.secondary', lineHeight: 1.3 }}>{name}</Box>
      </Box>
    </Tooltip>
  )
}

type LikertDistributionProps = {
  question: ResultQuestion
  // Indexed by answer value, 0 being "don't know"
  counts: number[]
  // The largest share of any value in the table, for a scale shared by its rows
  maxShare: number
}

// A column for each answer value on the 1–5 scale, with the mean pointing at its place on the scale
const LikertDistribution = ({ question, counts, maxShare }: LikertDistributionProps) => {
  const { t } = useTranslation()

  const total = counts.reduce((sum, count) => sum + count, 0)
  const share = (value: number) => (total > 0 ? counts[value] / total : 0)
  const name = (value: number) => (value === 0 ? t('feedbackView:dontKnowOption') : String(value))
  const mean = total > 0 ? (getMean(question) as number) : 0

  const label = [
    ...[...LIKERT_VALUES, 0].map(value => `${name(value)}: ${counts[value]}`),
    mean > 0 && `${t('feedbackSummary:average')}: ${mean.toFixed(2)}`,
  ]
    .filter(Boolean)
    .join(', ')

  const column = (value: number) => (
    <LikertColumn
      key={value}
      gridColumn={value === 0 ? 7 : value}
      name={name(value)}
      count={counts[value]}
      tooltip={`${name(value)}: ${counts[value]} (${formatPercent(counts[value], total)})`}
      height={Math.max(2, Math.round((maxShare > 0 ? share(value) / maxShare : 0) * COLUMN_HEIGHT))}
      color={value === 0 ? 'grey.400' : getColor(value)}
    />
  )

  return (
    <Box
      role="img"
      aria-label={label}
      sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr)) 1.5rem 3.5rem', alignItems: 'end' }}
    >
      {LIKERT_VALUES.map(column)}
      {column(0)}
      {/* The scale under the numbers of the columns, with the mean pointing at its place on it */}
      <Box
        sx={{
          gridColumn: '1 / 6',
          gridRow: 2,
          position: 'relative',
          height: mean > 0 ? `calc(${LINE_CENTER + 2 + CARET_GAP + CARET_HEIGHT}px + ${MEAN_SIZE})` : LINE_CENTER * 2,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: valuePosition(1),
            right: `calc(100% - ${valuePosition(5)})`,
            top: LINE_CENTER - 2,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'action.hover',
          }}
        />
        {LIKERT_VALUES.map(value => (
          <Box
            key={value}
            sx={{
              position: 'absolute',
              left: valuePosition(value),
              top: LINE_CENTER,
              width: 2,
              height: 8,
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'text.disabled',
            }}
          />
        ))}
        {mean > 0 && (
          <Tooltip
            title={`${t('feedbackSummary:average')}: ${mean.toFixed(2)}`}
            placement="bottom"
            slotProps={{ popper: { modifiers: TOOLTIP_MODIFIERS } }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: valuePosition(mean),
                top: LINE_CENTER + 2 + CARET_GAP,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  width: 0,
                  height: 0,
                  borderLeft: `${CARET_WIDTH}px solid transparent`,
                  borderRight: `${CARET_WIDTH}px solid transparent`,
                  borderBottom: `${CARET_HEIGHT}px solid ${getColor(mean)}`,
                  printColorAdjust: 'exact',
                }}
              />
              <AverageResult
                question={question}
                variant="outlined"
                sx={{ width: MEAN_SIZE, height: MEAN_SIZE, '& .MuiTypography-root': { fontSize: '0.8125rem' } }}
              />
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}

export default LikertDistribution
