import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { ResultQuestion } from './blocks'

import { getAcualAnswerCount } from '../QuestionResults/utils'

type AnswerCountProps = {
  question: ResultQuestion
  feedbackCount: number
}

const AnswerCount = ({ question, feedbackCount }: AnswerCountProps) => {
  const { t } = useTranslation()

  return (
    <Typography variant="caption" color="textSecondary" component="div" sx={{ mt: 0.5 }}>
      {t('questionResults:answerCount', { answers: getAcualAnswerCount(question), feedbacks: feedbackCount })}
    </Typography>
  )
}

export default AnswerCount
