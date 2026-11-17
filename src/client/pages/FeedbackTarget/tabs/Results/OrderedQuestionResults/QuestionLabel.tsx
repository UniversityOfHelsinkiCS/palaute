import type { ElementType, ReactNode } from 'react'

import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { ResultQuestion } from './blocks'
import type { PublicitySettings } from './QuestionPublicity'

import { getLanguageValue } from '../../../../../util/languageUtils'
import NotPublicTag from './NotPublicTag'
import QuestionPublicity from './QuestionPublicity'

type QuestionLabelProps = {
  question: ResultQuestion
  // Rendered as a heading when given
  headingLevel?: number
  isPublic: boolean
  publicity?: PublicitySettings
  children?: ReactNode
}

// The contents of the question column: label, description and the publicity of the question
const QuestionLabel = ({ question, headingLevel, isPublic, publicity, children }: QuestionLabelProps) => {
  const { i18n } = useTranslation()
  const description = getLanguageValue(question.data.description, i18n.language)

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        id={`question-${question.id}-label`}
        component={(headingLevel ? `h${headingLevel}` : 'div') as ElementType}
        variant="body1"
        fontWeight="medium"
      >
        {getLanguageValue(question.data.label, i18n.language)}
      </Typography>
      {description && (
        <Typography id={`question-${question.id}-description`} variant="body2" color="textSecondary">
          {description}
        </Typography>
      )}
      {children}
      {publicity && (
        <Box sx={{ mt: 0.75, '@media print': { display: 'none' } }}>
          <QuestionPublicity question={question} {...publicity} />
        </Box>
      )}
      {!publicity && !isPublic && <NotPublicTag />}
    </Box>
  )
}

export default QuestionLabel
