import type { ReactNode } from 'react'

import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { ResultQuestion } from './blocks'
import type { PublicitySettings } from './QuestionPublicity'

import { getLanguageValue } from '../../../../../util/languageUtils'
import AnswerCount from './AnswerCount'
import { ANSWER_SX, BLOCK_CLASS, QUESTION_ROW_SX } from './layout'
import QuestionLabel from './QuestionLabel'

type QuestionBlockProps = {
  question: ResultQuestion
  headingLevel: number
  feedbackCount: number
  isPublic: boolean
  publicity?: PublicitySettings
  children: ReactNode
}

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
      sx={QUESTION_ROW_SX}
    >
      <QuestionLabel question={question} headingLevel={headingLevel} isPublic={isPublic} publicity={publicity}>
        <AnswerCount question={question} feedbackCount={feedbackCount} />
      </QuestionLabel>
      <Box sx={ANSWER_SX}>{children}</Box>
    </Box>
  )
}

export default QuestionBlock
