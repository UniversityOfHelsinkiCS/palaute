import React, { useMemo } from 'react'

import { Card, CardContent, makeStyles } from '@material-ui/core'

import { getQuestionsWithFeedback } from './utils'
import LikertResults from './LikertResults'
import MultipleChoiceResults from './MultipleChoiceResults'
import SingleChoiceResults from './SingleChoiceResults'

const useStyles = makeStyles((theme) => ({
  questionItem: {
    '&:not(:last-child)': {
      marginBottom: theme.spacing(2),
    },
  },
}))

const componentByType = {
  LIKERT: LikertResults,
  MULTIPLE_CHOICE: MultipleChoiceResults,
  SINGLE_CHOICE: SingleChoiceResults,
}

const QuestionItem = ({ question, className }) => {
  const Component = componentByType[question.type]

  const content = Component ? <Component question={question} /> : null

  return (
    <Card className={className}>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

const QuestionResults = ({ questions, feedbacks }) => {
  const classes = useStyles()

  const questionsWithFeedbacks = useMemo(
    () => getQuestionsWithFeedback(questions, feedbacks),
    [questions, feedbacks],
  )

  return (
    <div>
      {questionsWithFeedbacks.map((q) => (
        <QuestionItem
          key={q.id}
          question={q}
          className={classes.questionItem}
        />
      ))}
    </div>
  )
}

export default QuestionResults
