import type { ReactNode } from 'react'

import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { ResultQuestion } from './blocks'
import type { PublicitySettings } from './QuestionPublicity'

import { getLanguageValue } from '../../../../../util/languageUtils'
import AnswerCount from './AnswerCount'
import { BLOCK_CLASS, QUESTION_COLUMN, SECTION_GAP } from './layout'
import QuestionLabel from './QuestionLabel'

type QuestionBlockProps = {
  question: ResultQuestion
  headingLevel: number
  feedbackCount: number
  isPublic: boolean
  publicity?: PublicitySettings
  children: ReactNode
}

// The question on the left and its answers on the right, stacked on narrow screens
const QuestionBlock = ({
  question,
  headingLevel,
  feedbackCount,
  isPublic,
  publicity,
  children,
}: QuestionBlockProps) => {
  const { i18n } = useTranslation()
  const hasDescription = Boolean(getLanguageValue(question.data.description, i18n.language))

  return (
    <Box
      component="section"
      className={BLOCK_CLASS}
      aria-labelledby={`question-${question.id}-label`}
      aria-describedby={hasDescription ? `question-${question.id}-description` : undefined}
      sx={{
        display: 'grid',
        alignItems: 'start',
        columnGap: SECTION_GAP,
        rowGap: 1.5,
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: `${QUESTION_COLUMN} minmax(0, 1fr)` },
      }}
    >
      <QuestionLabel question={question} headingLevel={headingLevel} isPublic={isPublic} publicity={publicity}>
        <AnswerCount question={question} feedbackCount={feedbackCount} />
      </QuestionLabel>
      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Box>
  )
}

export default QuestionBlock
