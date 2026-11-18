import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { ResultQuestion } from './blocks'
import type { PublicitySettings } from './QuestionPublicity'

import AverageResult from '../QuestionResults/AverageResult'
import AnswerCount from './AnswerCount'
import { getLikertCounts } from './counts'
import { BLOCK_CLASS, COLUMN_GAP, NUMBERS_WIDTH, QUESTION_COLUMN, SECTION_GAP } from './layout'
import LikertDistribution from './LikertDistribution'
import QuestionLabel from './QuestionLabel'

const rowSx = {
  display: 'grid',
  alignItems: 'center',
  columnGap: SECTION_GAP,
  rowGap: 0.75,
  py: 1.25,
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: `${QUESTION_COLUMN} minmax(0, 1fr)` },
}

// The chart ends where the option bars of choice questions do, and the mean sits under their numbers
const chartCellSx = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', md: `minmax(0, 1fr) ${NUMBERS_WIDTH}` },
  columnGap: { xs: 3, md: COLUMN_GAP },
  alignItems: 'end',
  justifyItems: 'end',
}

type LikertTableProps = {
  questions: ResultQuestion[]
  headingLevel: number
  feedbackCount: number
  publicQuestionIds: number[]
  publicity?: PublicitySettings
}

// Consecutive Likert questions, each with a column chart of its answers and its mean
const LikertTable = ({ questions, headingLevel, feedbackCount, publicQuestionIds, publicity }: LikertTableProps) => {
  const { t } = useTranslation()

  const rows = questions.map(question => ({ question, counts: getLikertCounts(question) }))
  const maxShare = Math.max(
    0,
    ...rows.map(({ counts }) => {
      const total = counts.reduce((sum, count) => sum + count, 0)
      return total > 0 ? Math.max(...counts) / total : 0
    })
  )

  return (
    <Box
      role="table"
      aria-label={t('feedbackView:dataTableCaption')}
      className={BLOCK_CLASS}
      sx={{
        '& > [role="row"] + [role="row"]': { borderTop: '1px solid', borderColor: 'divider' },
        '@media print': { breakInside: 'avoid' },
      }}
    >
      {rows.map(({ question, counts }) => (
        <Box key={question.id} role="row" sx={rowSx}>
          <Box role="rowheader" sx={{ minWidth: 0 }}>
            <QuestionLabel
              question={question}
              headingLevel={headingLevel}
              isPublic={publicQuestionIds.includes(question.id)}
              publicity={publicity}
            >
              <AnswerCount question={question} feedbackCount={feedbackCount} />
            </QuestionLabel>
          </Box>
          <Box role="cell" sx={chartCellSx}>
            <Box sx={{ justifySelf: 'stretch', minWidth: 0 }}>
              <LikertDistribution counts={counts} maxShare={maxShare} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AverageResult question={question} variant="outlined" />
              {/* Lines up with the value labels of the chart */}
              <Box aria-hidden="true" sx={{ typography: 'caption', color: 'text.secondary', lineHeight: 1.3 }}>
                {t('feedbackSummary:average')}
              </Box>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default LikertTable
