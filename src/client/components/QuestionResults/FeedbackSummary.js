import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Card, makeStyles, Typography } from '@material-ui/core'
import { getLanguageValue } from '../../util/languageUtils'
import { getQuestionsWithFeedback } from './utils'

const useStyles = makeStyles({
  card: {
    marginBottom: 10,
  },
  row: {
    marginTop: 5,
    padding: 5,
  },
})

const countAverage = (feedbacks) => {
  const sum = feedbacks.reduce((a, b) => a + b.data, 0)
  return (sum / feedbacks.length).toFixed(2)
}

const FeedbackSummary = ({ questions, feedbacks }) => {
  const classes = useStyles()
  const { i18n } = useTranslation()

  const questionsWithFeedbacks = useMemo(
    () => getQuestionsWithFeedback(questions, feedbacks),
    [questions, feedbacks],
  )

  return (
    <Card className={classes.card}>
      {questionsWithFeedbacks.map((question) => (
        <Typography variant="body1" key={question.id} className={classes.row}>
          {getLanguageValue(question.data.label, i18n.language)}
          {': '}
          {countAverage(question.feedbacks)}
        </Typography>
      ))}
    </Card>
  )
}

export default FeedbackSummary
