import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { ResultQuestion } from './blocks'
import type { PublicitySettings } from './QuestionPublicity'

import AnswerCount from './AnswerCount'
import { getLikertCounts } from './counts'
import { ANSWER_SX, BLOCK_CLASS, QUESTION_ROW_SX } from './layout'
import LikertDistribution from './LikertDistribution'
import QuestionLabel from './QuestionLabel'

type LikertTableProps = {
  questions: ResultQuestion[]
  headingLevel: number
  feedbackCount: number
  publicQuestionIds: number[]
  publicity?: PublicitySettings
}

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
        '& > [role="row"] + [role="row"]': { borderTop: '1px solid', borderColor: 'divider', mt: 3, pt: 3 },
        '@media print': { breakInside: 'avoid' },
      }}
    >
      {rows.map(({ question, counts }) => (
        <Box key={question.id} role="row" sx={QUESTION_ROW_SX}>
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
          <Box role="cell" sx={ANSWER_SX}>
            <LikertDistribution question={question} counts={counts} maxShare={maxShare} />
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default LikertTable
