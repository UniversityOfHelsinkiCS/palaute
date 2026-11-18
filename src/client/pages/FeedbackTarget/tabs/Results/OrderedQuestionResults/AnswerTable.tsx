import type { ReactNode } from 'react'

import { Box, Typography } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import type { ResultQuestion } from './blocks'

import { getLanguageValue } from '../../../../../util/languageUtils'
import { getTableAriaDescriptionKey } from '../QuestionResults/AccessibleChartTable'
import { formatPercent } from './counts'
import { COLUMN_GAP } from './layout'

const rowSx = {
  display: 'grid',
  gridTemplateColumns: { xs: 'minmax(0, 1fr) 3rem 3.5rem', sm: 'minmax(0, 1fr) 4rem 5rem' },
  columnGap: COLUMN_GAP,
  alignItems: 'baseline',
  py: 0.75,
}
const headerSx = { typography: 'caption', color: 'text.secondary', fontWeight: 'medium' }
const numberSx = { textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }

type AnswerTableProps = {
  question: ResultQuestion
  rows: { id: string | number; label: string; count: number }[]
  feedbackCount: number
  mean?: ReactNode
}

const AnswerTable = ({ question, rows, feedbackCount, mean }: AnswerTableProps) => {
  const { t, i18n } = useTranslation()
  const descriptionId = useId()

  return (
    <>
      <Box id={descriptionId} sx={visuallyHidden}>
        {t(getTableAriaDescriptionKey(question.type), {
          question: getLanguageValue(question.data.label, i18n.language),
        })}
      </Box>
      <Box
        role="table"
        aria-label={t('feedbackView:dataTableCaption')}
        aria-describedby={descriptionId}
        sx={{
          '& > [role="row"] + [role="row"]': { borderTop: '1px solid', borderColor: 'divider' },
          '@media print': { breakInside: 'avoid' },
        }}
      >
        <Box role="row" sx={[rowSx, headerSx, { pt: 0 }]}>
          <Box role="columnheader">{t('feedbackView:option')}</Box>
          <Box role="columnheader" sx={numberSx}>
            {t('feedbackView:count')}
          </Box>
          <Box role="columnheader" sx={numberSx}>
            {t('feedbackView:percentage')}
          </Box>
        </Box>
        {rows.map(row => (
          <Box key={row.id} role="row" sx={rowSx}>
            <Typography role="rowheader" sx={{ overflowWrap: 'anywhere' }}>
              {row.label}
            </Typography>
            <Typography role="cell" sx={numberSx}>
              {row.count}
            </Typography>
            <Typography role="cell" color="textSecondary" sx={numberSx}>
              {formatPercent(row.count, feedbackCount)}
            </Typography>
          </Box>
        ))}
        {mean && (
          <Box role="row" sx={[rowSx, { alignItems: 'center' }]}>
            <Typography role="rowheader">{t('feedbackSummary:average')}</Typography>
            <Box role="cell" aria-colspan={2} sx={{ gridColumn: '2 / -1', justifySelf: 'end' }}>
              {mean}
            </Box>
          </Box>
        )}
      </Box>
    </>
  )
}

export default AnswerTable
